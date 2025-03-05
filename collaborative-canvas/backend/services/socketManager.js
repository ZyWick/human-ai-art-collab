const boardService = require('./boardService');
const imageService = require('./imageService');
const keywordService = require('./keywordService');
const roomService = require('./roomService');
const {getImageDimensions} = require('../utils/imageProcessor')

const sharp = require ("sharp");
let rooms = [];

module.exports = (io, users) => {
    
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
      
        socket.on("joinRoom", async ({ username, roomID }) => {
          socket.join(roomID);
          users[socket.id] = { username, roomID };
      
          if (!rooms[roomID]) rooms[roomID] = [];
          rooms[roomID].push({ id: socket.id, username });
      
          io.to(roomID).emit("updateRoomUsers", rooms[roomID]);
        //   socket.emit("loadImages", latestBoardData.images);
        });
      
        //for link upload
        socket.on("newImage", async (imageData) => {
          try {
            const user = users[socket.id];
            if (user) {
              const { width, height } = await getImageDimensions(imageData.url);
              imageData.width = width;
              imageData.height = height;
              let image = await imageService.createImage(imageData)
              io.to(user.roomID).emit("newImage", image);
            }
        } catch (error) {
            console.log({ error: "Error adding image", details: error.message });
        }
        });

        socket.on("deleteImage", async (_id) => {
          try {
            const user = users[socket.id];
            if (user) {
              let result = await imageService.deleteImage(_id)
              console.log(result)
              io.to(user.roomID).emit("deleteImage", _id);
            }
        } catch (error) {
            console.log({ error: "Error adding image", details: error.message });
        }
        });

        socket.on("imageMoving", (updatedImage) => {
            const user = users[socket.id];
            if (user) {
              socket.to(user.roomID).emit("updateImagePosition", updatedImage);
            }
          });

          socket.on("keywordMoving", (updatedKeyword) => {
            const user = users[socket.id];
            if (user) {
              // Broadcast real-time keyword movement to other users
              socket.to(user.roomID).emit("updateKeywordPosition", updatedKeyword);
            }
          });
      
      
          socket.on("updateImagePosition", async (updatedImage) => {
            const user = users[socket.id];
            if (user) {
              // Update only the image position in DB
              const newImage = await imageService.updateImageCoordinates(updatedImage._id, updatedImage.x, updatedImage.y);
          
              // Populate keywords (since their positions remain unchanged)
              const populatedImage = await newImage.populate("keywords");
          
              // Send updated image to other users
              socket.to(user.roomID).emit("updateImagePosition", populatedImage);
            }
          });

          socket.on("updateKeywordPosition", async (updatedKeyword) => {
            const user = users[socket.id];
            if (user) {
              // Use the existing updateKeyword function to update the DB
              const newKeyword = await keywordService.updateKeyword(updatedKeyword._id, {
                offsetX: updatedKeyword.offsetX,
                offsetY: updatedKeyword.offsetY,
              });
          
              // Send updated keyword data back to the room
              socket.to(user.roomID).emit("updateKeywordPosition", newKeyword);
            }
          });
          
          
      
        socket.on("leave room", (username, roomID) => {
          if (username) {
            if (roomID && rooms[roomID]) {
              rooms[roomID] = rooms[roomID].filter((username) => username.id !== socket.id);
              console.log(`User left roomID ${roomID}:`, rooms[roomID]);
      
              if (rooms[roomID].length === 0) {
                delete rooms[roomID]; // Remove empty roomID
              } else {
                io.to(roomID).emit("updateRoomUsers", rooms[roomID]); // Update remaining users
              }
            }
            console.log("User disconnected:", users[socket.id]);
            delete users[socket.id];
          }
        });
      });
  };
  