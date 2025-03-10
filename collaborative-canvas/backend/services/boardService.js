const Board = require('../models/board.model');
const Image = require('../models/image.model');
const Keyword = require('../models/keyword.model');
const Room = require('../models/room.model')
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
}

/**
 * Update the board's name.
 * @param {String} boardId - The board's ObjectId.
 * @param {String} newName - The new board name.
 * @returns {Promise<Object|null>} The updated board document.
 */
const updateBoardName = async (boardId, newName) => 
  await Board.findByIdAndUpdate(boardId, { name: newName }, { new: true, runValidators: true });

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

const getGeneratedImages = async (boardId) =>
  await Board.findById(boardId).select('generatedImages')

const setGeneratedImages = async (boardId, images) => 
  await Board.findByIdAndUpdate(
    boardId,
    { $set: { generatedImages: images } },
    { new: true, runValidators: true }
  ).select('generatedImages');


const cloneBoard = async(boardId) => {
  const board = await Board.findById(boardId).lean();
  if (!board) throw new Error("Board not found");

  // Find existing copies to determine the next number
  const baseName = board.name.replace(/ \(v\d+\)$/, "");  // Remove previous copy numbering
  const existingCopies = await Board.find({ name: new RegExp(`^${baseName} \\(v\\d+\\)$`) }).lean();
  // Determine next available copy number
  const versionNumbers = existingCopies
        .map(b => {
            const match = b.name.match(/\(v(\d+)\)$/);
            return match ? parseInt(match[1], 10) : 0;
        })
        .sort((a, b) => a - b);

    const nextVersionNumber = (versionNumbers.length > 0) ? versionNumbers[versionNumbers.length - 1] + 1 : 1;
    const newBoardName = `${baseName} (v${nextVersionNumber})`;

  // Clone board keywords
  const clonedBoardKeywords = await Promise.all(
      board.keywords.map(async (keywordId) => {
          const keyword = await Keyword.findById(keywordId).lean();
          if (!keyword) return null;

          const newKeyword = new Keyword({
              ...keyword,
              _id: new mongoose.Types.ObjectId(),
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

          // Clone image keywords
          const clonedImageKeywords = await Promise.all(
              image.keywords.map(async (keywordId) => {
                  const keyword = await Keyword.findById(keywordId).lean();
                  if (!keyword) return null;

                  const newKeyword = new Keyword({
                      ...keyword,
                      _id: new mongoose.Types.ObjectId(),
                  });
                  await newKeyword.save();
                  return newKeyword._id;
              })
          );

          // Clone image with new keywords
          const newImage = new Image({
              ...image,
              _id: new mongoose.Types.ObjectId(),
              keywords: clonedImageKeywords.filter(Boolean),
          });
          await newImage.save();
          return newImage._id;
      })
  );

  // Clone board with new images, keywords, and incremental name
  const clonedBoard = new Board({
      ...board,
      _id: new mongoose.Types.ObjectId(),
      images: clonedImages.filter(Boolean),
      keywords: clonedBoardKeywords.filter(Boolean),
      name: newBoardName, // Incremental name
  });

  await clonedBoard.save();

  await Room.findByIdAndUpdate(clonedBoard.roomId, { $push: { boards: clonedBoard._id } });
  

  return clonedBoard;
}

const getBoard = async (boardId) => {
  return await Board.findById(boardId).populate([
    { path: 'images', populate: { path: 'keywords' } },
    { path: 'keywords' },
  ]);
};

  

module.exports = {
  getBoard,
  createBoard,
  updateBoardName,
  getGeneratedImages,
  setGeneratedImages,
  cloneBoard,
  deleteBoard,
};
