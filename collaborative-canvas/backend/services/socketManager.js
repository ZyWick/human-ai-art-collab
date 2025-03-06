const imageService = require('./imageService');
const keywordService = require('./keywordService');
const { getImageDimensions } = require('../utils/imageProcessor');

const rooms = {};

module.exports = (io, users) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on("joinRoom", async ({ username, roomID }) => {
      try {
        socket.join(roomID);
        users[socket.id] = { username, roomID };

        if (!rooms[roomID]) rooms[roomID] = [];
        rooms[roomID].push({ id: socket.id, username });

        io.to(roomID).emit("updateRoomUsers", rooms[roomID]);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });
      
    socket.on("newImage", async (imageData) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const { width, height } = await getImageDimensions(imageData.url);
        imageData.width = width;
        imageData.height = height;

        const image = await imageService.createImage(imageData);
        io.to(user.roomID).emit("newImage", image);
      } catch (error) {
        console.error("Error adding image:", error);
        socket.emit("error", { message: "Failed to add image" });
      }
    });

    socket.on("deleteImage", async (_id) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        await imageService.deleteImage(_id);
        io.to(user.roomID).emit("deleteImage", _id);
      } catch (error) {
        console.error("Error deleting image:", error);
        socket.emit("error", { message: "Failed to delete image" });
      }
    });

    socket.on("imageMoving", (updatedImage) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomID).emit("updateImage", updatedImage);
      }
    });
      
    socket.on("updateImagePosition", async (updatedImage) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newImage = await imageService.updateImage(updatedImage._id, {
          x: updatedImage.x,
          y: updatedImage.y,
        });
        const populatedImage = await newImage.populate("keywords");

        socket.to(user.roomID).emit("updateImage", populatedImage);
      } catch (error) {
        console.error("Error updating image position:", error);
        socket.emit("error", { message: "Failed to update image position" });
      }
    });

    
    socket.on("keywordMoving", (updatedKeyword) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomID).emit("updateKeywordPosition", updatedKeyword);
      }
    });

    socket.on("updateKeywordPosition", async (updatedKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newKeyword = await keywordService.updateKeyword(updatedKeyword._id, {
          offsetX: updatedKeyword.offsetX,
          offsetY: updatedKeyword.offsetY,
        });

        io.to(user.roomID).emit("updateKeywordPosition", newKeyword);
      } catch (error) {
        console.error("Error updating keyword position:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("imageTransforming", (updatedImage) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomID).emit("updateImage", updatedImage);
        console.log(updatedImage)
      }
    });

    socket.on("updateImageTransformation", async (updatedImage) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newImage = await imageService.updateImage(updatedImage._id, {
          x: updatedImage.x,
          y: updatedImage.y,
          width: updatedImage.width,
          height: updatedImage.height,
        });
        const populatedImage = await newImage.populate("keywords");

        socket.to(user.roomID).emit("updateImage", populatedImage);
      } catch (error) {
        console.error("Error updating image position:", error);
        socket.emit("error", { message: "Failed to update image position" });
      }
    });
      

    socket.on("leave room", async ({ username, roomID }) => {
      try {
        if (!username || !roomID) return;

        rooms[roomID] = rooms[roomID]?.filter((user) => user.id !== socket.id) || [];

        if (rooms[roomID].length === 0) {
          delete rooms[roomID];
        } else {
          io.to(roomID).emit("updateRoomUsers", rooms[roomID]);
        }

        delete users[socket.id];
        socket.leave(roomID);
        console.log(`User ${username} left room ${roomID}`);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    socket.on("disconnect", () => {
      try {
        const user = users[socket.id];
        if (user && rooms[user.roomID]) {
          rooms[user.roomID] = rooms[user.roomID].filter((u) => u.id !== socket.id);
          if (rooms[user.roomID].length === 0) delete rooms[user.roomID];

          io.to(user.roomID).emit("updateRoomUsers", rooms[user.roomID]);
        }

        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
      } catch (error) {
        console.error("Error on disconnect:", error);
      }
    });
  });
};