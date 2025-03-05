require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { uploadImage, deleteS3Image } = require("./services/s3service");
const imageService = require("./services/imageService")
const socketManager = require('./services/socketManager');

const boardRoutes = require('./routes/board.routes');
const imageRoutes = require('./routes/image.routes');
const keywordRoutes = require('./routes/keyword.routes');
const roomRoutes = require('./routes/room.routes');

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
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());

// 🔹 Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, {cors: { origin: "*" }});
let users = [];
socketManager(io, users);

app.use('/boards', boardRoutes);
app.use('/images', imageRoutes);
app.use('/keywords', keywordRoutes);
app.use('/rooms', roomRoutes);

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
      const result = await uploadImage(req.file);
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
      
      if (user) {
          let image = await imageService.createImage(newImage)
          io.to(user.roomID).emit("newImage", image);
      }
      res.json({ message: "Upload successful", ...result });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
