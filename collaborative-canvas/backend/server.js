// Import and configure environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import 3rd-party libraries
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';

// Import local services and routes (use .js extension for relative imports)
import { uploadImage } from './src/controllers/upload.controller.js';
import socketManager from './src/services/socketManager.js';
import boardRoutes from './src/routes/board.routes.js';
import roomRoutes from './src/routes/room.routes.js';
import authRoutes from './src/routes/auth.routes.js';

// CORS origins array
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://d3kigqhpgswrju.cloudfront.net",
  "https://aicollabdesign.space",
  "https://baseline.aicollabdesign.space",
];

// Configure Multer for image uploads
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

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });

let users = [];
let rooms = [];
let boardKWCache = [];
let debounceMap = {};
let isImgGenRunning = [];

socketManager(io, users, rooms, boardKWCache, debounceMap, isImgGenRunning);

// Register HTTP routes
app.use('/boards', boardRoutes);
app.use('/rooms', roomRoutes);
app.use('/auth', authRoutes);

// Image upload route
/**
 * @function
 * @description Handles image uploads via Multer and processes them using imageService logic.
 */
app.post("/upload", upload.array("images", 10), uploadImage(users, io));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
