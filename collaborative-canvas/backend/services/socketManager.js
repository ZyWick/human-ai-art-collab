const imageService = require('./imageService');
const keywordService = require('./keywordService');
const boardService = require('./boardService')
const roomService = require('./roomService')
const threadService = require('./threadService')
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

    socket.on("updateBoardName", async ({boardId, boardName}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedBoard = await boardService.updateBoardName(boardId, boardName)
        io.to(user.roomId).emit("updateBoardName", {boardId: updatedBoard._id, boardName: updatedBoard.name});
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("updateRoomName", async ({roomId, roomName}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedRoom = await roomService.updateRoomName(roomId, roomName)
        io.to(user.roomId).emit("updateRoomName", updatedRoom.name);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
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

    socket.on("deleteImage", async ({_id, keywords}) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        await imageService.deleteImage(_id);
        io.to(user.roomId).emit("deleteImage", {_id, keywords});
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

    socket.on("updateDesignDetails", (designDetails) => {
      const user = users[socket.id];
      if (user) {
        socket.to(user.roomId).emit("updateDesignDetails", designDetails);
      }
    });

    socket.on("updateDesignDetailsDone", async (designDetails) => {
      const user = users[socket.id];
      if (user) {
        const newDesignDetails = await roomService.updateDesignDetailsDb(user.roomId, designDetails);
        socket.to(user.roomId).emit("updateDesignDetails", newDesignDetails);
      }
    });

      
    socket.on("updateImage", async (updatedImage) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newImage = await imageService.updateImage(updatedImage._id, updatedImage);
        const populatedImage = await newImage.populate([
          {
            path: "parentThreads",
            model: "Thread",
            populate: { 
              path: "children", 
              model: "Thread" 
            }, // Populate child threads for images' parentThreads
          },
          {
            path: "keywords",
            populate: {
              path: "parentThreads",
              model: "Thread",
              populate: { 
                path: "children", 
                model: "Thread" 
              }, // Populate child threads for keywords' parentThreads
            },
          }
        ]);
        
        io.to(user.roomId).emit("updateImage", populatedImage);
      } catch (error) {
        console.error("Error updating image:", error);
        socket.emit("error", { message: "Failed to update image position" });
      }
    });

    socket.on("newKeyword", async (newKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const keyword = await keywordService.createKeyword(newKeyword);
        io.to(user.roomId).emit("newKeyword", keyword);
      } catch (error) {
          console.error("Error adding keyword:", error);
          socket.emit("error", { message: "Failed to add note keyword" });
      }
    })
    socket.on("deleteKeyword", async ({imageId, keywordId}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await await keywordService.deleteKeyword(keywordId)
        io.to(user.roomId).emit("deleteKeyword", {imageId, keywordId});
      } catch (error) {
          console.error("Error deleting keyword:", error);
          socket.emit("error", { message: "Failed to delete note keyword" });
      }
    })

    socket.on("removeKeywordFromSelected", (keywordId) => {
      const user = users[socket.id];
      if (user) {
        io.to(user.roomId).emit("removeKeywordFromSelected", keywordId);
      }
    });

    
    socket.on("clearKeywordVotes", async(boardId)=> {
      try {
        const user = users[socket.id];
        if (!user) return;
        await keywordService.resetVotesForBoard(boardId)
        io.to(user.roomId).emit("clearKeywordVotes", boardId);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
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

    socket.on("updateKeywordSelected", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedKeyword = await keywordService.updateKeywordWithChanges(update);
        socket.to(user.roomId).emit("updateKeywordSelected", {_id: updatedKeyword._id, 
          newIsSelected: updatedKeyword.isSelected});
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    
    socket.on("updateKeywordVotes", async({ keywordId, userId, action }) =>{
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedKeyword = await keywordService.updateKeywordVotes(keywordId, userId, action);
        io.to(user.roomId).emit("updateKeywordVotes", {_id: updatedKeyword._id, 
          votes: updatedKeyword.votes, downvotes: updatedKeyword.downvotes});
      } catch (error) {
          console.error("Error updating keyword:", error);
          socket.emit("error", { message: "Failed to delete note keyword" });
      }
    })
    
    socket.on("keywordMoving", (update) => {
      const user = users[socket.id];
      if (user) socket.to(user.roomId).emit("keywordMoving", update);
    });

    socket.on("updateKeywordOffset", async(update) =>{
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedKeyword = await keywordService.updateKeywordWithChanges( update);
        io.to(user.roomId).emit("updateKeywordOffset", {_id: updatedKeyword._id, 
          newOffsetX: updatedKeyword.offsetX, newOffsetY: updatedKeyword.offsetY});
      } catch (error) {
          console.error("Error updating keyword:", error);
          socket.emit("error", { message: "Failed to delete note keyword" });
      }
    })

    // socket.on("updateKeyword", async (updatedKeyword) => {
    //   try {
    //     const user = users[socket.id];
    //     if (!user) return;
    //     const newKeyword = await keywordService.updateKeyword(updatedKeyword._id, updatedKeyword);
    //     io.to(user.roomId).emit("updateKeyword", newKeyword);
    //   } catch (error) {
    //     console.error("Error updating keyword:", error);
    //     socket.emit("error", { message: "Failed to update keyword position" });
    //   }
    // });

    socket.on("removeKeywordFromBoard", async (updatedKeywordId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedKeyword = await keywordService.removeKeywordFromBoard(updatedKeywordId);
       io.to(user.roomId).emit("removeKeywordOffset", {_id: updatedKeyword._id});
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("sendChat", async (chatMessageWithBoardName) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        let {boardName, ...chatMessage} = chatMessageWithBoardName
        const newMessage = await roomService.addMessageToRoomChat(user.roomId, chatMessage);
        const newChat = {...newMessage, boardId: {_id: newMessage.boardId, name: boardName}}
        io.to(user.roomId).emit("sendChat", newChat);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("sendImageChat", async (chatMessage) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        let {imageId, ...newChatMessage} = chatMessage
        const newMessage = await imageService.addFeedback(imageId, newChatMessage);
       io.to(user.roomId).emit("sendImageChat", {imageId, feedback: newMessage});
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("starBoard", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await boardService.toggleStarredBoard(boardId);
        io.to(user.roomId).emit("starBoard", newBoard);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("toggleVoting", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await boardService.toggleVoting(boardId);
        io.to(user.roomId).emit("toggleVoting", newBoard);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("createThread", async(inputData)=> {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newThread = await threadService.createThread(inputData);
        io.to(user.roomId).emit("addThread", newThread)
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    })

    socket.on("editThreadValue", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedThread = await threadService.updateThreadWithChanges(update);
        io.to(user.roomId).emit("editThreadValue", {_id: updatedThread._id, 
          value: updatedThread.value});
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });

    socket.on("markThreadResolved", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        console.log(update)
        const updatedThread = await threadService.updateThreadWithChanges(update);
        io.to(user.roomId).emit("markThreadResolved", {_id: updatedThread._id, 
          isResolved: updatedThread.isResolved});
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
    

    socket.on("generateNewImage", async (generateData) => {
      try {
        const user = users[socket.id];
        if (!user) return; 
        const {boardId, keywords} = generateData;
        // get selected keywords!
        // generate new images
        const generatedImages = getRandomImages();
        // store to aws
        // pack urls to array
        // store urls to db
        const newIteration = {generatedImages, keywords}
        const newBoard = await boardService.addIteration(boardId, newIteration)
        io.to(user.roomId).emit("generateNewImage", {boardId: newBoard._id, newIterations: newBoard.iterations});
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
        io.to(user.roomId).emit("newBoard", newBoard._id);
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
        const result = await boardService.deleteBoard(boardId, roomId);
        io.to(user.roomId).emit("deleteBoard", boardId);
      } catch (error) {
        console.error("Error updating keyword:", error);
        socket.emit("error", { message: "Failed to update keyword position" });
      }
    });


    socket.on("leave room", async ({ username, roomId }) => {
      try {
        if (!username || !roomId) return;
        const user = users[socket.id];
        if (!user) return;
        
        rooms[roomId] = rooms[roomId]?.filter((user) => user.id !== socket.id) || [];

        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        } else {
          const usernames = rooms[roomId].map(item => item.username);
          io.to(roomId).emit("updateRoomUsers", ["noneoneo"]);
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
          let usernames;
          rooms[user.roomId] = rooms[user.roomId].filter((u) => u.id !== socket.id);
          if (rooms[user.roomId].length === 0) delete rooms[user.roomId];
          else usernames = rooms[user.roomId].map(item => item.username);
          io.to(user.roomId).emit("updateRoomUsers", usernames);
        }

        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
      } catch (error) {
        console.error("Error on disconnect:", error);
      }
    });
  });
};