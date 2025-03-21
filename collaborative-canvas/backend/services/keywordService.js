const Keyword = require("../models/keyword.model");
const Image = require("../models/image.model");
const Board = require("../models/board.model");

/**
 * Manually create a new keyword.
 * @param {Object} data - Contains boardId, imageId, x, y, isSelected, type, keyword.
 * @returns {Promise<Object>} The created keyword document.
 */
const createKeyword = async (data) => {
  const keyword = await Keyword.create(data);
  if (keyword.imageId)
    await Image.findByIdAndUpdate(keyword.imageId, {
      $push: { keywords: keyword._id },
    });
  else {
    let res = await Board.findByIdAndUpdate(keyword.boardId, {
      $push: { keywords: keyword._id },
    });
  }
  return keyword;
};

const updateKeywordWithChanges = async (update) => {
    const updatedKeyword = await Keyword.findByIdAndUpdate(
      update.id, // MongoDB `_id`
      { $set: update.changes }, // Fields to update
      { new: true } // Return the updated document
    );
    return updatedKeyword;
};

/**
 * Update a keyword's x, y, or isSelected fields.
 * @param {String} keywordId - The keyword's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const updateKeyword = async (keywordId, updateData) => {
  const updatedKeyword = await Keyword.findByIdAndUpdate(
    keywordId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  )

  return updatedKeyword;
};

const getKeyword = async (keywordId) => await Keyword.findById(keywordId);

const removeKeywordFromBoard = async (keywordId) =>
  await Keyword.findByIdAndUpdate(
    keywordId,
    {
      $unset: { offsetX: "", offsetY: "" }, // Remove offset values
      $set: { isSelected: false }, // Set isSelected to false
    },
    { new: true } // ✅ Return the updated document
  );

const updateKeywordVotes = async (keywordId, userId, action) => {
  try {
    const keyword = await Keyword.findById(keywordId);
    if (!keyword) return null;

    if (action === "upvote") {
      keyword.votes = keyword.votes.map((id) => id.toString()).includes(userId)
        ? keyword.votes.filter((id) => id.toString() !== userId) // Remove vote
        : [...keyword.votes, userId]; // Add vote
      keyword.downvotes = keyword.downvotes.filter(
        (id) => id.toString() !== userId
      ); // Remove any downvote
    } else if (action === "downvote") {
      keyword.downvotes = keyword.downvotes
        .map((id) => id.toString())
        .includes(userId)
        ? keyword.downvotes.filter((id) => id.toString() !== userId) // Remove downvote
        : [...keyword.downvotes, userId]; // Add downvote
      keyword.votes = keyword.votes.filter((id) => id.toString() !== userId); // Remove any upvote
    } else if (action === "remove") {
      keyword.votes = keyword.votes.filter((id) => id.toString() !== userId); // Remove from upvotes
      keyword.downvotes = keyword.downvotes.filter(
        (id) => id.toString() !== userId
      ); // Remove from downvotes
    }

    await keyword.save();
    return keyword;
  } catch (error) {
    console.error("Error updating votes:", error);
    return null;
  }
};

/**
 * Toggle the isSelected field of a keyword.
 * @param {String} keywordId - The keyword's ObjectId.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const toggleKeywordSelection = async (keywordId) => {
  const keyword = await Keyword.findById(keywordId);
  if (!keyword) throw new Error("Keyword not found");
  return await keyword
    .updateOne({ isSelected: !keyword.isSelected }, { new: true })
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

  if (imageId)
    await Image.findByIdAndUpdate(imageId, { $pull: { keywords: keywordId } });
  if (boardId)
    await Board.findByIdAndUpdate(boardId, { $pull: { keywords: keywordId } });
  await Keyword.findByIdAndDelete(keywordId);
};

const resetVotesForBoard = async (boardId) => {
  const result = await Keyword.updateMany(
    { boardId: boardId }, // Filter: Only keywords with this boardId
    { $set: { votes: [], downvotes: [] } } // Reset both votes and downvotes
  );

  return result;
};

module.exports = {
  getKeyword,
  createKeyword,
  // updateKeyword,
  removeKeywordFromBoard,
  toggleKeywordSelection,
  deleteKeyword,
  updateKeywordVotes,
  resetVotesForBoard,
  updateKeywordWithChanges,
};
