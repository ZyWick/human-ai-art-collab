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
  "https://drlvl1wvuyq5z.cloudfront.net",
  "https://baseline.aicollabdesign.space",
];

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization,board-id,socket-id"
}));

app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Authorization,board-id,socket-id");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(204).end();
  } else {
    res.status(403).end();
  }
});

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

// Image upload route
/**
 * @function
 * @description Handles image uploads via Multer and processes them using imageService logic.
 */
app.post("/upload", (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  upload.array("images", 10)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadImage(users, io));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
  // Ensure the origin is reflected in the error response
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  }

  // Handle other errors like bad mimetype
  if (err.message.includes("Only image files are allowed")) {
    return res.status(400).json({ error: err.message });
  }

  console.error("Unexpected server error:", err);
  return res.status(500).json({ error: "Server error" });
});

