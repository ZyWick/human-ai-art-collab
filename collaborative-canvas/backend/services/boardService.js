const Board = require("../models/board.model");
const Image = require("../models/image.model");
const Keyword = require("../models/keyword.model");
const Room = require("../models/room.model");
const Thread = require("../models/thread.model");
const mongoose = require("mongoose");

/**
 * Create a new board.
 * @param {Object} boardData - The board details.
 * @returns {Promise<Object>} The created board document.
 */
const createBoard = async (boardData) => {
  const board = await Board.create(boardData);
  await Room.findByIdAndUpdate(board.roomId, { $push: { boards: board._id } });
  return board;
};

/**
 * Update the board's name.
 * @param {String} boardId - The board's ObjectId.
 * @param {String} newName - The new board name.
 * @returns {Promise<Object|null>} The updated board document.
 */
const updateBoardName = async (boardId, newName) =>
  await Board.findByIdAndUpdate(
    boardId,
    { name: newName },
    { new: true, runValidators: true }
  );

/**
 * Delete a board and all its associated images and keywords.
 * @param {String} boardId - The board's ObjectId.
 * @returns {Promise<Object|null>} The deleted board document.
 */
const deleteBoard = async (boardId, roomId) => {
  await Promise.all([
    Keyword.deleteMany({ boardId }),
    Image.deleteMany({ boardId }),
  ]);
  await Room.findByIdAndUpdate(roomId, { $pull: { boards: boardId } });
  return await Board.findByIdAndDelete(boardId);
};

const getIterations = async (boardId) =>
  await Board.findById(boardId).select("iteration");

const addIteration = async (boardId, newIteration) =>
  await Board.findByIdAndUpdate(
    boardId,
    { $push: { iterations: newIteration } }, // Push new iteration to the array
    { new: true, runValidators: true } // Returns the updated document
  );

const cloneBoard = async (boardId) => {
  const board = await Board.findById(boardId).lean();
  if (!board) throw new Error("Board not found");

  // Find existing copies to determine the next number
  const baseName = board.name.replace(/ \(v\d+\)$/, ""); // Remove previous copy numbering
  const existingCopies = await Board.find({
    name: new RegExp(`^${baseName} \\(v\\d+\\)$`),
  }).lean();
  // Determine next available copy number
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

  const clonedBoardId = new mongoose.Types.ObjectId(); // Generate new boardId first

  // Clone board keywords and assign boardId
  const clonedBoardKeywords = await Promise.all(
    board.keywords.map(async (keywordId) => {
      const keyword = await Keyword.findById(keywordId).lean();
      if (!keyword) return null;

      const newKeyword = new Keyword({
        ...keyword,
        _id: new mongoose.Types.ObjectId(),
        boardId: clonedBoardId, // Assign correct boardId
        imageId: null, // Not linked to any image
      });
      await newKeyword.save();
      return newKeyword._id;
    })
  );

  // Clone images and their keywords
  const clonedImages = await Promise.all(
    board.images.map(async (imageId) => {
      const image = await Image.findById(imageId).lean();
      if (!image) return null;

      const newImageId = new mongoose.Types.ObjectId(); // Generate new imageId

      // Clone image keywords and assign correct boardId & imageId
      const clonedImageKeywords = await Promise.all(
        image.keywords.map(async (keywordId) => {
          const keyword = await Keyword.findById(keywordId).lean();
          if (!keyword) return null;

          const newKeyword = new Keyword({
            ...keyword,
            _id: new mongoose.Types.ObjectId(),
            boardId: clonedBoardId, // Assign correct boardId
            imageId: newImageId, // Assign correct new imageId
          });
          await newKeyword.save();
          return newKeyword._id;
        })
      );

      // Clone image with new keywords and assign boardId
      const newImage = new Image({
        ...image,
        _id: newImageId,
        keywords: clonedImageKeywords.filter(Boolean),
        boardId: clonedBoardId, // Assign correct boardId
      });
      await newImage.save();
      return newImage._id;
    })
  );

  // Clone board with new images, keywords, and incremental name
  const clonedBoard = new Board({
    ...board,
    _id: clonedBoardId, // Use the generated boardId
    images: clonedImages.filter(Boolean),
    keywords: clonedBoardKeywords.filter(Boolean),
    name: newBoardName, // Incremental name
    createdAt: new Date(), // Set to now
    updatedAt: new Date(), // Set to now
  });

  await clonedBoard.save();

  // Update room reference
  await Room.findByIdAndUpdate(clonedBoard.roomId, {
    $push: { boards: clonedBoard._id },
  });

  return clonedBoard;
};

const getBoard = async (boardId) => {
  // Fetch board details first
  const board = await Board.findById(boardId).lean();
  if (!board) {
    throw new Error("Board not found");
  }

  // Fetch images, keywords, and threads in parallel
  const [images, keywords, threads] = await Promise.all([
    Image.find({ boardId }).lean(),
    Keyword.find({ boardId }).lean(),
    Thread.find({ boardId }).sort({ createdAt: 1 }).lean(),
  ]);

  return { board, images, keywords, threads };
};


const toggleStarredBoard = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error("Board not found");

  return await Board.findByIdAndUpdate(
    boardId,
    { isStarred: !board.isStarred }, // Toggle value manually
    { new: true }
  );
};

const toggleVoting = async (boardId) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error("Board not found");

  return await Board.findByIdAndUpdate(
    boardId,
    { isVoting: !board.isVoting }, // Toggle value manually
    { new: true }
  );
};

const updateBoardWithChanges = async (update) => {
  const updatedBoard = await Board.findByIdAndUpdate(
    update.id, // MongoDB `_id`
    { $set: update.changes }, // Fields to update
    { new: true } // Return the updated document
  );
  return updatedBoard;
};

module.exports = {
  updateBoardWithChanges,
  getBoard,
  createBoard,
  updateBoardName,
  getIterations,
  addIteration,
  cloneBoard,
  deleteBoard,
  toggleStarredBoard,
  toggleVoting,
};
