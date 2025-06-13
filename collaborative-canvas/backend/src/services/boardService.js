// board.service.js
// ESM module version of your board service logic for Node.js v22
// Imports are now ESM; all functions are exported via export default at the end

import Board from '../models/board.model.js';
import Image from '../models/image.model.js';
import Keyword from '../models/keyword.model.js';
import Room from '../models/room.model.js';
import Thread from '../models/thread.model.js';
import mongoose from 'mongoose';

/**
 * Create a new board.
 * @param {Object} boardData - The board details.
 * @returns {Promise<Object>} The created board document.
 */
export const createBoard = async (boardData) => {
  const board = await Board.create(boardData);
  await Room.findByIdAndUpdate(board.roomId, { $push: { boards: board._id } });
  return board;
};

/**
 * Delete a board and all its associated images and keywords.
 * @param {String} boardId - The board's ObjectId.
 * @returns {Promise<Object|null>} The deleted board document.
 */
export const deleteBoardById = async (boardId, roomId) => {
  await Promise.all([
    Keyword.deleteMany({ boardId }),
    Image.deleteMany({ boardId }),
  ]);
  await Room.findByIdAndUpdate(roomId, { $pull: { boards: boardId } });
  return await Board.findByIdAndDelete(boardId);
};

/**
 * Add a new iteration to the board.
 * @param {String} boardId - The board's ObjectId.
 * @param {Object} newIteration - Iteration object.
 * @returns {Promise<Object>} The created iteration.
 */
export const updateNewIteration = async (boardId, newIteration) => {
  const board = await Board.findById(boardId);
  board.iterations.push(newIteration);
  await board.save();
  const createdIteration = board.iterations[board.iterations.length - 1];
  return createdIteration;
};


/**
 * Fetch board details, images, keywords, and threads.
 * @param {String} boardId - The board's ObjectId.
 * @returns {Promise<Object>} All board-related data.
 */
export const findBoardById = async (boardId) => {
  const board = await Board.findById(boardId).lean();
  if (!board) throw new Error("Board not found");

  const [images, keywords, threads] = await Promise.all([
    Image.find({ boardId }).lean(),
    Keyword.find({ boardId }).lean(),
    Thread.find({ boardId }).sort({ createdAt: 1 }).lean(),
  ]);

  return { board, images, keywords, threads };
};

/**
 * Toggle voting flag on a board.
 * @param {String} boardId - The board's ObjectId.
 * @returns {Promise<Object>} Updated board doc.
 */
export const toggleVotingById = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error("Board not found");

  return await Board.findByIdAndUpdate(
    boardId,
    { isVoting: !board.isVoting },
    { new: true }
  );
};

/**
 * Update a board using a changes object.
 * @param {Object} update - {id, changes}
 * @returns {Promise<Object>} The updated board document.
 */
export const updateBoardWithChanges = async (update) => {
  const updatedBoard = await Board.findByIdAndUpdate(
    update.id,
    { $set: update.changes },
    { new: true }
  );
  return updatedBoard;
};

/**
 * Add an image and prompt to iteration.
 * @param {String} boardId - The board's ObjectId.
 * @param {String} iterationId - The iteration's ObjectId.
 * @param {String} imageUrl - The image URL.
 * @param {Object} prompt - The prompt object.
 * @returns {Promise<Object>} Mongo result.
 */
export async function updateNewImageAndPromptToIteration(boardId, iterationId, imageUrl, prompt) {
  return await Board.updateOne(
    { _id: boardId, "iterations._id": iterationId },
    {
      $push: {
        "iterations.$.generatedImages": imageUrl,
        "iterations.$.prompt": prompt.prompt,
        "iterations.$.promptWhole": prompt,
      },
    }
  );
}

/**
 * Clone a board (with images and keywords) with versioned name.
 * @param {String} boardId - The board's ObjectId.
 * @returns {Promise<Object>} The cloned board document.
 */
export const cloneBoard = async (boardId) => {
  const board = await Board.findById(boardId).lean();
  if (!board) throw new Error("Board not found");

  // Find existing copies to determine the next number
  const baseName = board.name.replace(/ \(v\d+\)$/, "");
  const existingCopies = await Board.find({
    name: new RegExp(`^${baseName} \\(v\\d+\\)$`),
  }).lean();

  const versionNumbers = existingCopies
    .map((b) => {
      const match = b.name.match(/\(v(\d+)\)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .sort((a, b) => a - b);

  const nextVersionNumber =
    versionNumbers.length > 0
      ? versionNumbers[versionNumbers.length - 1] + 1
      : 1;
  const newBoardName = `${baseName} (v${nextVersionNumber})`;

  const clonedBoardId = new mongoose.Types.ObjectId();

  // Clone board keywords and assign boardId
  const clonedBoardKeywords = await Promise.all(
    (board.keywords || []).map(async (keywordId) => {
      const keyword = await Keyword.findById(keywordId).lean();
      if (!keyword) return null;
      const newKeyword = new Keyword({
        ...keyword,
        _id: new mongoose.Types.ObjectId(),
        boardId: clonedBoardId,
        imageId: null,
      });
      await newKeyword.save();
      return newKeyword._id;
    })
  );

  // Clone images and their keywords
  const clonedImages = await Promise.all(
    (board.images || []).map(async (imageId) => {
      const image = await Image.findById(imageId).lean();
      if (!image) return null;

      const newImageId = new mongoose.Types.ObjectId();

      const clonedImageKeywords = await Promise.all(
        (image.keywords || []).map(async (keywordId) => {
          const keyword = await Keyword.findById(keywordId).lean();
          if (!keyword) return null;
          const newKeyword = new Keyword({
            ...keyword,
            _id: new mongoose.Types.ObjectId(),
            boardId: clonedBoardId,
            imageId: newImageId,
          });
          await newKeyword.save();
          return newKeyword._id;
        })
      );

      const newImage = new Image({
        ...image,
        _id: newImageId,
        keywords: clonedImageKeywords.filter(Boolean),
        boardId: clonedBoardId,
      });
      await newImage.save();
      return newImage._id;
    })
  );

  // Clone board with new images, keywords, and incremental name
  const clonedBoard = new Board({
    ...board,
    _id: clonedBoardId,
    images: clonedImages.filter(Boolean),
    keywords: clonedBoardKeywords.filter(Boolean),
    name: newBoardName,
    isStarred: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await clonedBoard.save();

  // Update room reference
  await Room.findByIdAndUpdate(clonedBoard.roomId, {
    $push: { boards: clonedBoard._id },
  });

  return clonedBoard;
};
