require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { uploadS3Image, deleteS3Image } = require("./services/s3service");
const imageService = require("./services/imageService");
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
socketManager(io, users);

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
      const fullImage = req.files[0]

      let imageCaptions = [];
      try {
        imageCaptions = await Promise.all(
          req.files.map(async (segment) => {
            try {
              return await getCaption(segment.buffer);
            } catch (captionError) {
              console.error("Caption generation failed:", captionError);
              return null; // Continue even if a caption fails
            }
          })
        );
      } catch (error) {
        console.error("Caption processing error:", error);
        imageCaptions = []; // Fallback to an empty array
      }
  
      let keywords = [];
      try {
        keywords = await extractKeywords(imageCaptions.filter(c => c !== null)); // Filter out failed captions
      } catch (keywordError) {
        console.error("Keyword extraction failed:", keywordError);
        keywords = []; // Continue without keywords
      }

      const result = await uploadS3Image(fullImage);
      const user = users[req.headers["socket-id"]];
      const { width, height, x, y } = req.body; 
      const newImage = {
        boardId: req.headers["board-id"],
        url: result.url,
        x: x,
        y: y,
        width: width,
        height: height,
      };
      
      if (!user) return;

      let image = await imageService.createImage(newImage, keywords)
      io.to(user.roomId).emit("newImage", { image, user: { id: user.userId, name: user.username } });
      res.json({ message: "Upload successful", ...result, ...image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));