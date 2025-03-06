const Keyword = require('../models/keyword.model');

/**
 * Manually create a new keyword.
 * @param {Object} data - Contains boardId, imageId, x, y, isSelected, type, keyword.
 * @returns {Promise<Object>} The created keyword document.
 */
const createKeyword = (data) => new Keyword(data).save();

/**
 * Update a keyword's x, y, or isSelected fields.
 * @param {String} keywordId - The keyword's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const updateKeyword = (keywordId, updateData) => 
  Keyword.findByIdAndUpdate(keywordId, updateData, { new: true, runValidators: true });

/**
 * Toggle the isSelected field of a keyword.
 * @param {String} keywordId - The keyword's ObjectId.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const toggleKeywordSelection = async (keywordId) => {
  const keyword = await Keyword.findById(keywordId);
  if (!keyword) throw new Error("Keyword not found");
  return keyword.updateOne({ isSelected: !keyword.isSelected }, { new: true });
};

/**
 * Delete a keyword.
 * @param {String} keywordId - The keyword's ObjectId.
 * @returns {Promise<Object|null>} The deleted keyword document or null if not found.
 */
const deleteKeyword = (keywordId) => Keyword.findByIdAndDelete(keywordId);

module.exports = {
  createKeyword,
  updateKeyword,
  toggleKeywordSelection,
  deleteKeyword,
};
