require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const imageService = require("./services/imageService");
const socketManager = require('./services/socketManager');

const boardRoutes = require('./routes/board.routes');
const roomRoutes = require('./routes/room.routes');
const authRoutes = require('./routes/auth.routes'); // Import auth routes

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://d3kigqhpgswrju.cloudfront.net",
  "https://aicollabdesign.space"
];

const upload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max file size
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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });
let users = [];
let rooms = [];
let boardKWCache = [], boardSKWCache = [];
socketManager(io, users, rooms, boardKWCache, boardSKWCache);

// Routes
app.use('/boards', boardRoutes);
app.use('/rooms', roomRoutes);
app.use('/auth', authRoutes); 

app.post("/upload", upload.array("images", 10), imageService.uploadImage(users, io));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));