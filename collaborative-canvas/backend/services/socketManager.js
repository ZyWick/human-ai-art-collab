const imageService = require('./imageService');
const keywordService = require('./keywordService');
const boardService = require('./boardService')
const { getImageDimensions } = require('../utils/imageProcessor');

const rooms = {};

module.exports = (io, users) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on("joinRoom", async ({ username, roomId }) => {
      try {
        socket.join(roomId);
        users[socket.id] = { username, roomId };

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ id: socket.id, username });
        const currUsers = rooms[roomId].map(user => user.username)
        io.to(roomId).emit("updateRoomUsers", currUsers);
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
        io.to(user.roomId).emit("newImage", image);
      } catch (error) {
        console.error("Error adding image:", error);
        socket.emit("error", { message: "Failed to add image" });
      }
    });

    socket.on("newKeyword", async ({newKeyword, selectedImage}) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const keyword = await keywordService.createKeyword(newKeyword);
        const updatedImage = {...selectedImage,
          keywords: [
            ...selectedImage.keywords,
            keyword
          ]
        }
        io.to(user.roomId).emit("updateImage", updatedImage);
      } catch (error) {
          console.error("Error adding keyword:", error);
          socket.emit("error", { message: "Failed to add image" });
      }
    })

    socket.on("newNoteKeyword", async (newKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const keyword = await keywordService.createKeyword(newKeyword);
        io.to(user.roomId).emit("newNoteKeyword", keyword);
      } catch (error) {
          console.error("Error adding keyword:", error);
          socket.emit("error", { message: "Failed to add note keyword" });
      }
    })
    socket.on("deleteNoteKeyword", async (keywordId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        io.to(user.roomId).emit("deleteNoteKeyword", keywordId);
      } catch (error) {
          console.error("Error deleting keyword:", error);
          socket.emit("error", { message: "Failed to delete note keyword" });
      }
    })

    socket.on("toggleSelectedKeyword", async(keywordId) =>{
      try {
        const user = users[socket.id];
        if (!user) return;
        io.to(user.roomId).emit("toggleSelectedKeyword", keywordId);
      } catch (error) {
          console.error("Error deleting keyword:", error);
          socket.emit("error", { message: "Failed to delete note keyword" });
      }
    })

    socket.on("deleteImage", async (_id) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        await imageService.deleteImage(_id);
        io.to(user.roomId).emit("deleteImage", _id);
      } catch (error) {
        console.error("Error deleting image:", error);
        socket.emit("error", { message: "Failed to delete image" });
      }
    });

    socket.on("imageMoving", (updatedImage) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomId).emit("updateImage", updatedImage);
      }
    });
    
    socket.on("imageTransforming", (updatedImage) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomId).emit("updateImage", updatedImage);
      }
    });

    socket.on("keywordMoving", (updatedKeyword) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomId).emit("updateKeyword", updatedKeyword);
      }
    });

    socket.on("keywordMovingNote", (updatedKeyword) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomId).emit("updateKeywordNote", updatedKeyword);
      }
    });
      
    socket.on("updateImage", async (updatedImage) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newImage = await imageService.updateImage(updatedImage._id, updatedImage);
        const populatedImage = await newImage.populate("keywords");

        io.to(user.roomId).emit("updateImage", populatedImage);
      } catch (error) {
        console.error("Error updating image:", error);
        socket.emit("error", { message: "Failed to update image position" });
      }
    });

    socket.on("updateKeyword", async (updatedKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newKeyword = await keywordService.updateKeyword(updatedKeyword._id, updatedKeyword);
        io.to(user.roomId).emit("updateKeyword", newKeyword);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("removeKeywordOffset", async (updatedKeywordId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await keywordService.removeKeywordOffset(updatedKeywordId);
        const newKeyword = await keywordService.getKeyword(updatedKeywordId);
        io.to(user.roomId).emit("updateKeyword", newKeyword);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("updateKeywordNote", async (updatedKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newKeyword = await keywordService.updateKeyword(updatedKeyword._id, updatedKeyword);
        socket.to(user.roomId).emit("updateKeywordNote", newKeyword);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });
    
    const imageUrls = [
      "https://www.cnet.com/a/img/resize/8d159fb0c99a75843d3585dd2ae8cc9e6fa12773/hub/2017/08/03/75c3b0ae-5a2d-4d75-b72b-055247b4378f/marvelinfinitywar-captainamerica.jpg?auto=webp&fit=crop&height=1200&width=1200",
      "https://static.wikia.nocookie.net/marvel-rivals/images/d/de/Jeff_the_Land_Shark_Hero_Portrait.png/revision/latest?cb=20240819162642",
      "https://static.wikia.nocookie.net/marveldatabase/images/5/5d/Jeffrey_%28Land_Shark%29_%28Earth-616%29_from_It%27s_Jeff_Infinity_Comic_Vol_1_3_001.jpg/revision/latest?cb=20210910103413",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIM-V3IWZ3ApUOIbNdJweDaZqUsEuBck2o2Q&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwz5qS8aIDsdasa44YrfqFMethUesT2Rurjg&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0xVNiPNF2WCAlkW9uMl-wIRFosEMWzjUf5A&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCEft7JF8CZjUYkqMjQwqBJSp6XiVQHmV0wAp4uJglNnjBcv2csbKoDYG1y3KcFnVDKGk&usqp=CAU",
      "https://i.pinimg.com/736x/dc/ed/b3/dcedb3767aadd312965da861d7ee71a9.jpg",
      "https://statik.tempo.co/data/2024/07/14/id_1318659/1318659_720.jpg",
      "https://i0.wp.com/www.thewrap.com/wp-content/uploads/2023/05/rocket-raccoon-guardians-early.jpg?fit=1200%2C675&ssl=1"
    ]
    const getRandomImages = (count = 5) => {
      return imageUrls.toSorted(() => Math.random() - 0.5).slice(0, count);
    };
    

    socket.on("generateNewImage", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        // get selected keywords!
        // generate new images
        const newImages = getRandomImages();
        // store to aws
        // pack urls to array
        // store urls to db
        const newBoard = await boardService.setGeneratedImages(boardId, newImages)
        io.to(user.roomId).emit("generateNewImage", newBoard);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    })

    socket.on("cloneBoard", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newBoard = await boardService.cloneBoard(boardId);
        console.log(newBoard)
        console.log(newBoard._id)
        io.to(user.roomId).emit("cloneBoard", newBoard._id);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("newBoard", async (boardData) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await boardService.createBoard(boardData);
        io.to(user.roomId).emit("newBoard", newBoard._id);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("deleteBoard", async (boardId, roomId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        console.log(boardId, roomId)
        const result = await boardService.deleteBoard(boardId, roomId);
        console.log(result)
        io.to(user.roomId).emit("deleteBoard", boardId);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });


    socket.on("leave room", async ({ username, roomId }) => {
      try {
        if (!username || !roomId) return;

        rooms[roomId] = rooms[roomId]?.filter((user) => user.id !== socket.id) || [];

        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("updateRoomUsers", rooms[roomId]);
        }

        delete users[socket.id];
        socket.leave(roomId);
        console.log(`User ${username} left room ${roomId}`);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    socket.on("disconnect", () => {
      try {
        const user = users[socket.id];
        if (user && rooms[user.roomId]) {
          rooms[user.roomId] = rooms[user.roomId].filter((u) => u.id !== socket.id);
          if (rooms[user.roomId].length === 0) delete rooms[user.roomId];

          io.to(user.roomId).emit("updateRoomUsers", rooms[user.roomId]);
        }

        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
      } catch (error) {
        console.error("Error on disconnect:", error);
      }
    });
  });
};