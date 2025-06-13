// Import local services and utilities using ES module syntax
import {updateImageWithChanges, deleteImageById} from './imageService.js';
import {createKeyword, updateKeywordWithChanges, resetVotesForBoard, updateKeywordVotes, deleteKeywordById, removeKeywordFromBoard} from './keywordService.js';
import {createBoard, updateBoardWithChanges, updateNewIteration, deleteBoardById, cloneBoard, toggleVotingById} from './boardService.js';
import {updateDesignDetailsDb, updateRoomName} from './roomService.js';
import {createThread, updateThreadWithChanges} from './threadService.js';

import {
  recommendBroadNarrowKeywords,
  generateTextualDescriptions,
} from '../utils/llm.js';

import {
  checkMeaningfulChanges,
  debounceBoardFunction,
  handleLeave,
  generateAndStoreImage,
  createNewIteration,
  extractKeywords,
  createImgGenProgressCounter,
  generateImageInput,
} from '../utils/helpers.js';

/**
 * Main socket event handlers - registers all events for a new socket connection.
 * 
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 * @param {Object} users - Active user map (socket.id -> user)
 * @param {Object} rooms - Room participants (roomId -> [{id, username, userId}])
 * @param {Object} boardKWCache - Per-board cache for recommended keywords
 * @param {Object} debounceMap - Debounce map for throttling functions
 * @param {Object} isImgGenRunning - Per-board in-progress image generation
 */
const registerSocketHandlers = (
  io,
  users,
  rooms,
  boardKWCache,
  debounceMap,
  isImgGenRunning
) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    /**
     * Emit event to a room with user details
     */
    const ioEmitWithUser = (event, user, data = {}) => {
      if (!socket || !user) return;
      io.to(user.roomId).emit(event, {
        ...data,
        user: { id: user.userId, name: user.username },
      });
    };

    /**
     * Emit event to all other sockets in a room except sender
     */
    const socketEmitWithUser = (event, user, data = {}) => {
      if (!socket || !user) return;
      socket.to(user.roomId).emit(event, {
        ...data,
        user: { id: user.userId, name: user.username },
      });
    };

    // Register all socket event handlers...

    // Handling joining a room
    socket.on('joinRoom', async ({ username, userId, roomId }) => {
      try {
        socket.join(roomId);
        users[socket.id] = { username, userId, roomId };

        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push({ id: socket.id, username, userId });

        const currUsers = rooms[roomId].map(user => ({
          userId: user.userId,
          username: user.username,
        }));

        io.to(roomId).emit('updateRoomUsers', currUsers);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('updateRoomName', async ({ roomId, roomName }) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateRoomName', user, { newRoomName: roomName });
        await updateRoomName(roomId, roomName);
      } catch (error) {
        console.error('Error updating room name:', error);
        socket.emit('error', { message: 'Failed to update room name' });
      }
    });

    socket.on('updateDesignDetails', (designDetails) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateDesignDetails', user, { designDetails });
      } catch (error) {
        console.error('Error updating design brief:', error);
        socket.emit('error', { message: 'Failed to update design brief' });
      }
    });

    socket.on('updateDesignDetailsDone', async (designDetails) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateDesignDetailsDone', user, { designDetails });
        await updateDesignDetailsDb(user.roomId, designDetails);
      } catch (error) {
        console.error('Error updating design brief:', error);
        socket.emit('error', { message: 'Failed to update design brief' });
      }
    });

    socket.on('deleteImage', async ({ _id, keywords }) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await deleteImageById(_id);
        ioEmitWithUser('deleteImage', user, { _id, keywords });
      } catch (error) {
        console.error('Error deleting image:', error);
        socket.emit('error', { message: 'Failed to delete image' });
      }
    });

    socket.on('imageMoving', (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateImage', user, { update });
      } catch (error) {
        console.error('Error moving image:', error);
        socket.emit('error', { message: 'Failed to move image' });
      }
    });

    socket.on('imageTransforming', (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateImage', user, { update });
      } catch (error) {
        console.error('Error transforming image:', error);
        socket.emit('error', { message: 'Failed to transforming image' });
      }
    });

    socket.on('updateImage', async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateImage', user, { update });
        await updateImageWithChanges(update);
      } catch (error) {
        console.error('Error updating image position:', error);
        socket.emit('error', { message: 'Failed to update image position' });
      }
    });

    socket.on('newKeyword', async (newKeyword) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const keyword = await createKeyword(newKeyword);
        ioEmitWithUser('newKeyword', user, { keyword });
      } catch (error) {
        console.error('Error adding keyword:', error);
        socket.emit('error', { message: 'Failed to add keyword' });
      }
    });

    socket.on('keywordMoving', (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateKeyword', user, { update });
      } catch (error) {
        console.error('Error moving keyword:', error);
        socket.emit('error', { message: 'Failed to move keyword' });
      }
    });

    socket.on('updateKeywordOffset', async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateKeyword', user, { update });
        await updateKeywordWithChanges(update);
      } catch (error) {
        console.error('Error updating keyword position:', error);
        socket.emit('error', { message: 'Failed to update keyword position' });
      }
    });

    socket.on('deleteKeyword', async ({ imageId, keywordId }) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        ioEmitWithUser('deleteKeyword', user, { imageId, keywordId });
        await deleteKeywordById(keywordId);
      } catch (error) {
        console.error('Error deleting keyword:', error);
        socket.emit('error', { message: 'Failed to delete keyword' });
      }
    });

    socket.on('removeKeywordFromBoard', async (updatedKeywordId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('removeKeywordOffset', user, { _id: updatedKeywordId });
        await removeKeywordFromBoard(updatedKeywordId);
      } catch (error) {
        console.error('Error removing keyword from board:', error);
        socket.emit('error', { message: 'Failed to remove keyword from board' });
      }
    });

    socket.on('updateKeywordVotes', async ({ keywordId, userId, action }) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updatedKeyword = await updateKeywordVotes(
          keywordId,
          userId,
          action
        );
        ioEmitWithUser('updateKeyword', user, {
          update: {
            id: updatedKeyword._id,
            changes: {
              votes: updatedKeyword.votes,
              downvotes: updatedKeyword.downvotes,
            },
          },
        });
      } catch (error) {
        console.error('Error updating keyword votes:', error);
        socket.emit('error', { message: 'Failed to update keyword votes' });
      }
    });

    socket.on('clearKeywordVotes', async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await resetVotesForBoard(boardId);
        socketEmitWithUser('clearKeywordVotes', user, { boardId });
      } catch (error) {
        console.error('Error clearing keyword votes:', error);
        socket.emit('error', { message: 'Failed to clear keyword votes' });
      }
    });

    socket.on('updateKeywordSelected', async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateKeywordSelected', user, { update });
        await updateKeywordWithChanges(update);
      } catch (error) {
        console.error('Error updating keyword selected:', error);
        socket.emit('error', { message: 'Failed to update keyword selected' });
      }
    });

    socket.on('createThread', async (inputData) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newThread = await createThread(inputData);
        ioEmitWithUser('addThread', user, { newThread });
      } catch (error) {
        console.error('Error creating thread:', error);
        socket.emit('error', { message: 'Failed to create thread' });
      }
    });

    socket.on('updateThread', async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const updateDate = new Date();
        ioEmitWithUser('updateThread', user, { update: {
          id: update.id,
          changes: {
            ...update.changes, updatedAt: updateDate
          },
        } });
        await updateThreadWithChanges(update, updateDate);
      } catch (error) {
        console.error('Error editing thread:', error);
        socket.emit('error', { message: 'Failed to edit thread' });
      }
    });

    socket.on('updateBoard', async (update) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        socketEmitWithUser('updateBoard', user, { update });
        await updateBoardWithChanges(update);
      } catch (error) {
        console.error('Error updating board:', error);
        socket.emit('error', { message: 'Failed to update board' });
      }
    });

    socket.on('generateNewImage', async ({ boardId, data, arrangement }) => {
      if (isImgGenRunning[boardId]) {
        console.log('Function is already running. Skipping this call.');
        return;
      }

      isImgGenRunning[boardId] = true;

      try {
        const user = users[socket.id];
        if (!user) return;

        const keywords = extractKeywords(data, arrangement);
        const newIteration = createNewIteration(keywords);
        const createdIteration = await updateNewIteration(boardId, newIteration);
        const progressCounter = createImgGenProgressCounter(io, user.roomId, boardId, createdIteration);
        ioEmitWithUser('updateBoardIterations', user, {
          update: {
            id: boardId,
            iteration: createdIteration,
          }
        });

        const textDescriptions = await generateTextualDescriptions(JSON.stringify({ data }, null, 2));
        progressCounter.add(10);

        const genImageInput = await generateImageInput(textDescriptions.output, arrangement);
        progressCounter.add(15);

        await Promise.all(
          genImageInput.map((input, index) =>
            generateAndStoreImage({
              input,
              index,
              boardId,
              iterationId: createdIteration._id,
              roomId: user.roomId,
              progressCounter,
              io,
            })
          )
        );

      } catch (error) {
        console.error('Error generating sketches:', error);
        socket.emit('error', { message: 'Failed to generate new image' });
      } finally {
        isImgGenRunning[boardId] = false;
      }
    });

    socket.on('cloneBoard', async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        const newBoard = await cloneBoard(boardId);
        ioEmitWithUser('newBoard', user, { board: newBoard });
      } catch (error) {
        console.error('Error duplicating board:', error);
        socket.emit('error', { message: 'Failed to duplicate board' });
      }
    });

    socket.on('toggleVoting', async (boardId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await toggleVotingById(boardId);
        ioEmitWithUser('updateBoard', user, {
          update: {
            id: newBoard._id,
            changes: { isVoting: newBoard.isVoting },
          },
        });
      } catch (error) {
        console.error('Error toggling voting', error);
        socket.emit('error', { message: 'Failed to toggle voting' });
      }
    });

    socket.on('recommendFromBoardKw', async ({ boardId, data }) => {
      try {
        const user = users[socket.id];
        if (!user) return;

        let previousData = boardKWCache[boardId];
        if (!previousData || checkMeaningfulChanges(previousData, data)) {
          debounceBoardFunction(debounceMap, boardId, 'board', async () => {
            const result = await recommendBroadNarrowKeywords(JSON.stringify({ data }, null, 2));
            if (result && typeof result === 'object') {
              io.to(user.roomId).emit('updateBoard', {
                update: {
                  id: boardId,
                  changes: {
                    BroadRecommendedKeywords: result.Broader,
                    SpecificRecommendedKeywords: result["More Specific"],
                  },
                },
              });
            }
            boardKWCache[boardId] = data;
          }, 15000);
        }
      } catch (error) {
        console.error('Error recommending board keyword:', error);
        socket.emit('error', {
          message: 'Failed to recommend keywords related to board',
        });
      }
    });

    socket.on('newBoard', async (boardData) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        const newBoard = await createBoard(boardData);
        ioEmitWithUser('newBoard', user, { board: newBoard });
      } catch (error) {
        console.error('Error creating new board:', error);
        socket.emit('error', { message: 'Failed to create new board' });
      }
    });

    socket.on('deleteBoard', async (boardId, roomId) => {
      try {
        const user = users[socket.id];
        if (!user) return;
        await deleteBoardById(boardId, roomId);
        ioEmitWithUser('deleteBoard', user, { boardId });
      } catch (error) {
        console.error('Error deleting board:', error);
        socket.emit('error', { message: 'Failed to delete board' });
      }
    });

    socket.on('leave room', () => handleLeave(users, rooms, socket, io));
    socket.on('disconnect', () => handleLeave(users, rooms, socket, io));
  });
};

export default registerSocketHandlers;