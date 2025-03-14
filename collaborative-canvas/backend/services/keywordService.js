const Keyword = require('../models/keyword.model');
const Image = require('../models/image.model')
const Board = require('../models/board.model')

/**
 * Manually create a new keyword.
 * @param {Object} data - Contains boardId, imageId, x, y, isSelected, type, keyword.
 * @returns {Promise<Object>} The created keyword document.
 */
const createKeyword = async (data) => {
  const keyword = await Keyword.create(data);
  if (keyword.imageId)
   await Image.findByIdAndUpdate(keyword.imageId, { $push: { keywords: keyword._id } });
  else {
    let res = await Board.findByIdAndUpdate(keyword.boardId, { $push: { keywords: keyword._id } });
  }
  return keyword;
  };

/**
 * Update a keyword's x, y, or isSelected fields.
 * @param {String} keywordId - The keyword's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const updateKeyword = async (keywordId, updateData) => 
  await Keyword.findByIdAndUpdate(keywordId, updateData, { new: true, runValidators: true });

const getKeyword = async (keywordId) =>
   await Keyword.findById(keywordId);

const removeKeywordFromBoard = async (keywordId) =>
  await Keyword.updateOne(
    { _id: keywordId },
    {
      $unset: { offsetX: "", offsetY: "" }, // Remove offset values
      $set: { isSelected: false }, // Set isSelected to false
    }
  );

const updateKeywordVotes =async(keywordId, userId) => {
  const keyword = await Keyword.findById(keywordId);
  if (!keyword) {
    throw new Error("Keyword not found");
}
const updateOperation = keyword.votes?.includes(userId)
            ? { $pull: { votes: userId } }  // Remove the vote if it exists
            : { $addToSet: { votes: userId } }; // Add the vote if it doesn't exist
console.log(updateOperation)
        const updatedKeyword = await Keyword.findByIdAndUpdate(
            keywordId,
            updateOperation,
            { new: true } // Return the updated document
        );
        return updatedKeyword;
}

/**
 * Toggle the isSelected field of a keyword.
 * @param {String} keywordId - The keyword's ObjectId.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const toggleKeywordSelection = async (keywordId) => {
  const keyword = await Keyword.findById(keywordId);
  if (!keyword) throw new Error("Keyword not found");
  return await keyword.updateOne({ isSelected: !keyword.isSelected }, { new: true });
};

/**
 * Delete a keyword.
 * @param {String} keywordId - The keyword's ObjectId.
 * @returns {Promise<Object|null>} The deleted keyword document or null if not found.
 */
const deleteKeyword = async (keywordId) => {
  const keyword = await Keyword.findById(keywordId);
  const boardId = keyword.boardId;
  const imageId = keyword.imageId;

  if (imageId) await Image.findByIdAndUpdate(imageId, { $pull: { keywords: keywordId } });
  if (boardId) await Board.findByIdAndUpdate(boardId, { $pull: { keywords: keywordId } });
  await Keyword.findByIdAndDelete(keywordId);
}

const resetVotesForBoard = async (boardId) => {
    const result = await Keyword.updateMany(
      { boardId: boardId }, // Filter: Only keywords with this boardId
      { $set: { votes: [] } } // Reset votes to an empty array
    );
    return result;
};

module.exports = {
  getKeyword,
  createKeyword,
  updateKeyword,
  removeKeywordFromBoard,
  toggleKeywordSelection,
  deleteKeyword,
  updateKeywordVotes,
  resetVotesForBoard,
};
