const Board = require('../models/board.model');
const Image = require('../models/image.model');
const Keyword = require('../models/keyword.model');

/**
 * Create a new board.
 * @param {Object} boardData - The board details.
 * @returns {Promise<Object>} The created board document.
 */
const createBoard = async (boardData) => Board.create(boardData);

/**
 * Update the board's name.
 * @param {String} boardId - The board's ObjectId.
 * @param {String} newName - The new board name.
 * @returns {Promise<Object|null>} The updated board document.
 */
const updateBoardName = async (boardId, newName) => 
  Board.findByIdAndUpdate(boardId, { name: newName }, { new: true, runValidators: true });

/**
 * Delete a board and all its associated images and keywords.
 * @param {String} boardId - The board's ObjectId.
 * @returns {Promise<Object|null>} The deleted board document.
 */
const deleteBoard = async (boardId) => {
  await Promise.all([
    Keyword.deleteMany({ boardId }),
    Image.deleteMany({ boardId }),
  ]);
  return Board.findByIdAndDelete(boardId);
};

module.exports = {
  createBoard,
  updateBoardName,
  deleteBoard,
};
