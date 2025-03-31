const imageService = require('./imageService');
const keywordService = require('./keywordService');
const boardService = require('./boardService')
const roomService = require('./roomService')
const threadService = require('./threadService')
const { recommendKeywords } = require('../utils/llm')

module.exports = (io, users) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    const rooms = {};
    const ioEmitWithUser = (event, user, data = {}) => {
      if (!socket || !user) return;
      io.to(user.roomId).emit(event, { ...data, user: { id: user.userId, name: user.username } });
    };

    const socketEmitWithUser = (event, user, data = {}) => {
      if (!socket || !user) return;
      socket.to(user.roomId).emit(event, { ...data, user: { id: user.userId, name: user.username } });
    };
    
    socket.on("joinRoom", async ({ username, userId, roomId }) => {
      try {
        socket.join(roomId);
        users[socket.id] = { username, userId, roomId };

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ id: socket.id, username, userId });
        const currUsers = rooms[roomId].map(user => user.username)

        io.to(roomId).emit("updateRoomUsers", currUsers);
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("updateRoomName", async ({roomId, roomName}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateRoomName", user, {newRoomName: roomName});
        await roomService.updateRoomName(roomId, roomName)
      } catch (error) {
        console.error("Error updating room name:", error);
        socket.emit("error", { message: "Failed to update room name" });
      }
    });    

    socket.on("updateDesignDetails", (designDetails) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateDesignDetails", user,  {designDetails});
      } catch (error) {
        console.error("Error updating design brief:", error);
        socket.emit("error", { message: "Failed to update design brief" });
      }
    });

    socket.on("updateDesignDetailsDone", async (designDetails) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateDesignDetailsDone", user, {designDetails});
        await roomService.updateDesignDetailsDb(user.roomId, designDetails);
      } catch (error) {
        console.error("Error updating design brief:", error);
        socket.emit("error", { message: "Failed to update design brief" });
      }
    });

      
    // socket.on("newImage", async (imageData) => {
    //   try {
    //     const user = users[socket.id];
    //     if (!user) return;

    //     const { width, height } = await getImageDimensions(imageData.url);
    //     imageData.width = width;
    //     imageData.height = height;

    //     const result = await imageService.createImage(imageData);
    //     ioEmitWithUser("newImage", user, {image: {image: result.image}});
    //   } catch (error) {
    //     console.error("Error adding image:", error);
    //     socket.emit("error", { message: "Failed to add image" });
    //   }
    // });

    socket.on("deleteImage", async ({_id, keywords}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await imageService.deleteImage(_id);
        ioEmitWithUser("deleteImage", user, {_id, keywords});
      } catch (error) {
        console.error("Error deleting image:", error);
        socket.emit("error", { message: "Failed to delete image" });
      }
    });

    socket.on("imageMoving", (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateImage", user, {update});
      } catch (error) {
        console.error("Error moving image:", error);
        socket.emit("error", { message: "Failed to move image" });
      }
    });
    
    socket.on("imageTransforming", (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateImage", user, {update});
      } catch (error) {
        console.error("Error transforming image:", error);
        socket.emit("error", { message: "Failed to transforming image" });
      }
    });

    socket.on("updateImage", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateImage", user, {update});
        const updateimage = await imageService.updateImageWithChanges(update);
        console.log("update", updateimage)
      } catch (error) {
        console.error("Error updating image position:", error);
        socket.emit("error", { message: "Failed to update image position" });
      }
    });

    socket.on("newKeyword", async (newKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const keyword = await keywordService.createKeyword(newKeyword);
        ioEmitWithUser("newKeyword", user, {keyword});
      } catch (error) {
          console.error("Error adding keyword:", error);
          socket.emit("error", { message: "Failed to add keyword" });
      }
    })

    socket.on("keywordMoving", (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateKeyword", user, {update});
      } catch (error) {
        console.error("Error moving keyword:", error);
        socket.emit("error", { message: "Failed to move keyword" });
    }
    });

    socket.on("updateKeywordOffset", async(update) =>{
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateKeyword", user, {update});
        await keywordService.updateKeywordWithChanges( update);
      } catch (error) {
          console.error("Error updating keyword position:", error);
          socket.emit("error", { message: "Failed to update keyword position" });
      }
    })

    socket.on("deleteKeyword", async ({imageId, keywordId}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        ioEmitWithUser("deleteKeyword", user, {imageId, keywordId});
        await keywordService.deleteKeyword(keywordId)
      } catch (error) {
          console.error("Error deleting keyword:", error);
          socket.emit("error", { message: "Failed to delete keyword" });
      }
    })
    
    socket.on("removeKeywordFromBoard", async (updatedKeywordId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("removeKeywordOffset", user, {_id: updatedKeywordId});
        await keywordService.removeKeywordFromBoard(updatedKeywordId);
     } catch (error) {
        console.error("Error removing keyword from board:", error);
        socket.emit("error", { message: "Failed to remove keyword from board" });
      }
    });

    socket.on("updateKeywordVotes", async({ keywordId, userId, action }) =>{
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedKeyword = await keywordService.updateKeywordVotes(keywordId, userId, action);
        ioEmitWithUser("updateKeyword", user, {update: { id: updatedKeyword._id, 
          changes: {votes: updatedKeyword.votes, downvotes: updatedKeyword.downvotes}}});
      } catch (error) {
          console.error("Error updating keyword votes:", error);
          socket.emit("error", { message: "Failed to update keyword votes" });
      }
    })
    
    socket.on("clearKeywordVotes", async(boardId)=> {
      try {
        const user = users[socket.id];
        if (!user) return;
        await keywordService.resetVotesForBoard(boardId)
        socketEmitWithUser("clearKeywordVotes", user, {boardId});
      } catch (error) {
        console.error("Error clearing keyword votes:", error);
        socket.emit("error", { message: "Failed to clear keyword votes" });
      }
    })
    
    socket.on("updateKeywordSelected", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateKeywordSelected", user, {update});
        await keywordService.updateKeywordWithChanges(update);
      } catch (error) {
        console.error("Error updating keyword selected:", error);
        socket.emit("error", { message: "Failed to update keyword selected" });
      }
    });
    
    socket.on("createThread", async(inputData)=> {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newThread = await threadService.createThread(inputData);
        ioEmitWithUser("addThread", user, {newThread})
      } catch (error) {
        console.error("Error creating thread:", error);
        socket.emit("error", { message: "Failed to create thread" });
      }
    })

    socket.on("updateThread", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateThread", user, {update});
        await threadService.updateThreadWithChanges(update);
      } catch (error) {
        console.error("Error editing thread:", error);
        socket.emit("error", { message: "Failed to edit thread" });
      }
    });
    
    socket.on("updateBoard", async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser("updateBoard", user, {update});
        await boardService.updateBoardWithChanges(update)
      } catch (error) {
        console.error("Error updating board:", error);
        socket.emit("error", { message: "Failed to update board" });
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
        ioEmitWithUser("updateBoardIterations", user, {update: {
          id: boardId, iteration: newIteration  }});
        await boardService.addIteration(boardId, newIteration)
      
      } catch (error) {
        console.error("Error generating sketches:", error);
        socket.emit("error", { message: "Failed to generate new image" });
      }
    })

    socket.on("cloneBoard", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newBoard = await boardService.cloneBoard(boardId);
        ioEmitWithUser("newBoard", user, {newBoardId: newBoard._id});
      } catch (error) {
        console.error("Error duplicating board:", error);
        socket.emit("error", { message: "Failed to duplicate board" });
      }
    });

    socket.on("starBoard", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await boardService.toggleStarredBoard(boardId);
        ioEmitWithUser("updateBoard", user, {update: {id: newBoard._id, changes: {isStarred: newBoard.isStarred}}});
      } catch (error) {
        console.error("Error starring board:", error);
        socket.emit("error", { message: "Failed to star board" });
      }
    });

    
    socket.on("toggleVoting", async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await boardService.toggleVoting(boardId);
        ioEmitWithUser("updateBoard", user, {update: {id: newBoard._id, changes: {isVoting: newBoard.isVoting}}});
      } catch (error) {
        console.error("Error toggling voting", error);
        socket.emit("error", { message: "Failed to toggle voting" });
      }
    });

    
    const boardKeywordsCache = new Map();
    socket.on("recommendFromBoardKw", async({boardId, keywords}) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        
        const newKeywordsSet = new Set(keywords.map(k => `${k.keyword}|${k.type}`));
        const prevKeywordsSet = boardKeywordsCache.get(boardId);
        if (prevKeywordsSet && newKeywordsSet.size === prevKeywordsSet.size &&
            [...newKeywordsSet].every(kw => prevKeywordsSet.has(kw))) {
            return;
        }
        boardKeywordsCache.set(boardId, newKeywordsSet);

        let result = []
        // result = await recommendKeywords(keywords)
        if (result && result.length > 0) 
          io.to(user.roomId).emit("updateBoard", {update:{id: boardId,
            changes: { boardRecommendedKeywords: result }}});
      } catch (error) {
          console.error("Error recommending board keyword:", error);
          socket.emit("error", { message: "Failed to recommend keywords related to board" });
      }
    })

    const selectedKeywordsCache = new Map();
    socket.on("recommendFromSelectedKw", async({boardId, keywords}) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newKeywordsSet = new Set(keywords.map(k => `${k.keyword}|${k.type}`));
        const prevKeywordsSet = selectedKeywordsCache.get(boardId);
        if (prevKeywordsSet && newKeywordsSet.size === prevKeywordsSet.size &&
            [...newKeywordsSet].every(kw => prevKeywordsSet.has(kw))) {
            return;
        }
        selectedKeywordsCache.set(boardId, newKeywordsSet);

        //process kw
        let result = []
        // result = await recommendKeywords(keywords)
        if (result && result.length > 0) 
          io.to(user.roomId).emit("updateBoard", {update: {id: boardId,
            changes: { selectedRecommendedKeywords: result }}});
      } catch (error) {
          console.error("Error recommending selected keyword:", error);
          socket.emit("error", { message: "Failed to ecommend keywords related to selected" });
      }
    })

    socket.on("newBoard", async (boardData) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await boardService.createBoard(boardData);
        ioEmitWithUser("newBoard", user, {board: newBoard});
      } catch (error) {
        console.error("Error creating new board:", error);
        socket.emit("error", { message: "Failed to create new board" });
      }
    });

    socket.on("deleteBoard", async (boardId, roomId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await boardService.deleteBoard(boardId, roomId);
        ioEmitWithUser("deleteBoard", user, {boardId});
      } catch (error) {
        console.error("Error deleting board:", error);
        socket.emit("error", { message: "Failed to delete board" });
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
          io.to(roomId).emit("updateRoomUsers", usernames);
        }

        delete users[socket.id];
        socket.leave(roomId);
        // console.log(`User ${username} left room ${roomId}`);
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