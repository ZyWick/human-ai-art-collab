require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "https://human-ai-art-collab-dev.onrender.com",
  "https://human-ai-art-collab.vercel.app"
];

// Function to check if the origin is a Vercel preview URL
const isVercelPreview = (origin) => {
  return origin && origin.endsWith(".vercel.app");
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isVercelPreview(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Socket.IO logic
const users = {};
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", async ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };

    let roomData = await Room.findOne({ name: room });
    if (!roomData) {
      roomData = await Room.create({ name: room, images: [] });
    }

    socket.emit("loadImages", roomData.images);
    io.to(room).emit("userJoined", `${username} joined ${room}!`);
  });

  socket.on("newImage", async (imageData) => {
    const user = users[socket.id];
    if (user) {
      await Room.updateOne({ name: user.room }, { $push: { images: imageData } });
      socket.to(user.room).emit("newImage", imageData);
    }
  });

  socket.on("updateImage", async (updatedImage) => {
    const user = users[socket.id];
    if (user) {
      await Room.updateOne(
        { name: user.room, "images.id": updatedImage.id },
        { $set: { "images.$": updatedImage } }
      );
      socket.to(user.room).emit("updateImage", updatedImage);
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit("userLeft", `${user.username} left`);
      delete users[socket.id];
    }
    console.log("User disconnected:", socket.id);
  });
});

// Routes
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/room");
app.use("/api", authRoutes);
app.use("/api", roomRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));