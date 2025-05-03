require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { uploadS3Image, deleteS3Image } = require("./services/s3service");
const imageService = require("./services/imageService");
const keywordService = require("./services/keywordService");
const socketManager = require('./services/socketManager');
const {getCaption} = require('./utils/imageCaptioning')
const { extractKeywords } = require('./utils/llm')

const boardRoutes = require('./routes/board.routes');
const imageRoutes = require('./routes/image.routes');
const keywordRoutes = require('./routes/keyword.routes');
const roomRoutes = require('./routes/room.routes');
const authRoutes = require('./routes/auth.routes'); // Import auth routes

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "https://human-ai-art-collab-dev.onrender.com",
  "https://human-ai-art-collab.vercel.app"
];

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  storage: multer.memoryStorage(), // Store file in memory for processing
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

const app = express();
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization,board-id,socket-id"
}));

app.options("*", cors());


app.use(express.json());

// 🔹 Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
let users = [];
let rooms = {};
socketManager(io, users, rooms);

// Routes
app.use('/boards', boardRoutes);
app.use('/images', imageRoutes);
app.use('/keywords', keywordRoutes);
app.use('/rooms', roomRoutes);
app.use('/auth', authRoutes); // Add auth routes

app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
        if (!req.files || req.files.length !== 10) {
          return res.status(400).json({ error: "Expected 10 images (1 full + 9 segments)" });
      }

      const fullImage = req.files[0];
      const { width, height, x, y } = req.body;
      const boardId = req.headers["board-id"];
      const socketId = req.headers["socket-id"];
      const user = users[socketId];
      const uploadId = Math.floor(Math.random() * 1000000);

      if (!user) {
        return res.status(401).json({ error: "Invalid socket‑id" });
      }

      io.to(socketId).emit("addUploadProgress", {
        uploadId,
        fileName: fullImage.originalname,
      });
      
      // --- 1a) Upload to S3 ---
        let uploadResult;
        try {
          uploadResult = await uploadS3Image(fullImage);
        } catch (err) {
          console.error("❌ S3 upload failed:", err);
          return res.status(502).json({ error: "Image storage failed" });
        }

        io.to(socketId).emit("updateUploadProgress", {
          uploadId,
          progress: 10,
        });
      
         // --- 1b) Persist image record (without keywords) ---
        let imageDoc;
        try {
          imageDoc = await imageService.createImage({
            boardId,
            url: uploadResult.url,
            x,
            y,
            width,
            height,
          });
        } catch (err) {
          console.error("❌ Saving image to DB failed:", err);
          return res.status(500).json({ error: "Saving image failed" });
        }

        io.to(socketId).emit("updateUploadProgress", {
          uploadId,
          progress: 15,
        });

         // --- 1c) Notify clients right away ---
    io.to(user.roomId).emit("newImage", {
      image: imageDoc,
      user: { id: user.userId, name: user.username },
    });

// --- 1d) Kick off keyword work in background ---
    generateKeywords(imageDoc._id, user.roomId, req.files, socketId, uploadId).catch((err) => {
      console.error("❌ generateKeywords encountered an unhandled error:", err);
    });

    // --- 1e) Final HTTP response ---
    return res.status(201).json({
      message: "Image uploaded",
      url: uploadResult.url,
      image: imageDoc,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const generateKeywords = async (imageId, roomId, files, socketId, uploadId) => {
  const captions = await Promise.all(
    files.map((segment, idx) => {
      getCaption(segment.buffer).catch((err) => {
        console.error(`Caption generation failed for segment #${idx}:`, err);
        return null;
      })
      io.to(socketId).emit("updateUploadProgress", {
        uploadId,
        progress: 20 +  5 * idx,
      });
    }
    )
    
  );
  const validCaptions = captions.filter((c) => c != null);
  console.log(validCaptions)
   // 2b) Extract keywords (tolerate failure)
   let keywords = [];
   if (validCaptions.length) {
     try {
       keywords = await extractKeywords(validCaptions);
     } catch (err) {
       console.error("Keyword extraction failed:", err);
       // leave keywords = []
     }
   }

    // 2c) Insert keywords & link to image (tolerate DB failure)
  let newKeywords = [];
  if (keywords.length) {
    try {
      newKeywords = await keywordService.addKeywordsToImage(imageId, keywords);
    } catch (err) {
      console.error("Saving keywords to DB failed:", err);
      // leave newKeywords = []
    }
  }

  io.to(socketId).emit("updateUploadProgress", {
    uploadId,
    progress: 70,
  });
  
  newKeywords.forEach(keyword => {
    io.to(roomId).emit("newKeyword", { keyword });
  });

  io.to(socketId).emit("updateUploadProgress", {
    uploadId,
    progress: 75,
  });

  io.to(socketId).emit("updateUploadProgress", {
    uploadId,
    progress: 100,
  });

}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));