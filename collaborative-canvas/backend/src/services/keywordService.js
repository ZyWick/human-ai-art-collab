// Imports - now using ESM import syntax for all modules.
import Keyword from '../models/keyword.model.js';
import Image from '../models/image.model.js';
import Board from '../models/board.model.js';
import Thread from '../models/thread.model.js';

/**
 * Manually create a new keyword.
 * @param {Object} data - {boardId, imageId, x, y, isSelected, type, keyword}
 * @returns {Promise<Object>} The created keyword document.
 */
export const createKeyword = async (data) => {
  const keyword = await Keyword.create(data);
  if (keyword.imageId)
    await Image.findByIdAndUpdate(keyword.imageId, {
      $push: { keywords: keyword._id },
    });
  else {
    await Board.findByIdAndUpdate(keyword.boardId, {
      $push: { keywords: keyword._id },
    });
  }
  return keyword;
};

/**
 * Adds an 'Arrangement' keyword (with boundingBoxes) to an image.
 * @param {string} imageId
 * @param {Object} boundingBoxes
 * @returns {Promise<Object>} The inserted keyword document.
 */
export const addArrangementToImage = async (imageId, boundingBoxes) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error('Image not found');

  // Construct the keyword object
  const keywordData = {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    isCustom: false,
    type: 'Arrangement',
    keyword: 'Arrangement',
    boundingBoxes,
  };

  // Insert the keyword
  const insertedKeyword = await Keyword.create(keywordData);

  // Update the image's keyword references
  image.keywords.push(insertedKeyword._id);
  await image.save();

  return insertedKeyword;
};

/**
 * Inserts extracted keywords to an image and returns the inserted keywords.
 * @param {string} imageId
 * @param {Object} extractedKeywords
 * @returns {Promise<Array>} Array of inserted keyword documents.
 */
export const addKeywordsToImage = async (imageId, extractedKeywords) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error('Image not found');

  const keywordsData = []
  if (extractedKeywords && typeof extractedKeywords === 'object') {
    Object.entries(extractedKeywords).forEach(([category, keywords]) => {
      if (Array.isArray(keywords) && keywords.length) {
        keywords.forEach((keyword) => {
          if (keyword) {
            // Ensure keyword is valid
            keywordsData.push({
              boardId: image.boardId,
              imageId: image._id,
              isSelected: false,
              isCustom: false,
              type: category,
              keyword: keyword.trim(),
            });
          }
        });
      }
    });
  }

  let insertedKeywords = [];
  if (keywordsData.length) {
    insertedKeywords = await Keyword.insertMany(keywordsData);
    image.keywords = insertedKeywords.map((k) => k._id);
    await image.save();
  }

  return insertedKeywords;
};

/**
 * Update a keyword document with changes.
 * @param {Object} update - {id, changes}
 * @returns {Promise<Object>} The updated keyword document.
 */
export const updateKeywordWithChanges = async (update) => {
  const updatedKeyword = await Keyword.findByIdAndUpdate(
    update.id,
    { $set: update.changes },
    { new: true }
  );
  return updatedKeyword;
};

/**
 * Remove offset fields and deselect a keyword on a board.
 * @param {string} keywordId
 * @returns {Promise<Object|null>} The updated keyword document.
 */
export const removeKeywordFromBoard = async (keywordId) =>
  await Keyword.findByIdAndUpdate(
    keywordId,
    {
      $unset: { offsetX: '', offsetY: '' },
      $set: { isSelected: false, votes: [], downvotes: [] },
    },
    { new: true }
  );

/**
 * Update votes or downvotes for a keyword by a user.
 * @param {String} keywordId
 * @param {String} userId
 * @param {String} action - 'upvote', 'downvote', or 'remove'
 * @returns {Promise<Object|null>} The updated keyword document.
 */
export const updateKeywordVotes = async (keywordId, userId, action) => {
  try {
    const keyword = await Keyword.findById(keywordId);
    if (!keyword) return null;

    if (action === 'upvote') {
      keyword.votes = keyword.votes
        .map((id) => id.toString())
        .includes(userId)
        ? keyword.votes.filter((id) => id.toString() !== userId) // Remove vote
        : [...keyword.votes, userId]; // Add vote
      keyword.downvotes = keyword.downvotes.filter(
        (id) => id.toString() !== userId
      ); // Remove any downvote
    } else if (action === 'downvote') {
      keyword.downvotes = keyword.downvotes
        .map((id) => id.toString())
        .includes(userId)
        ? keyword.downvotes.filter((id) => id.toString() !== userId) // Remove downvote
        : [...keyword.downvotes, userId]; // Add downvote
      keyword.votes = keyword.votes.filter((id) => id.toString() !== userId); // Remove any upvote
    } else if (action === 'remove') {
      keyword.votes = keyword.votes.filter((id) => id.toString() !== userId); // Remove from upvotes
      keyword.downvotes = keyword.downvotes.filter(
        (id) => id.toString() !== userId
      ); // Remove from downvotes
    }

    await keyword.save();
    return keyword;
  } catch (error) {
    console.error('Error updating votes:', error);
    return null;
  }
};


/**
 * Delete a keyword. Also remove it from its image/board and delete related threads.
 * @param {String} keywordId
 * @returns {Promise<Object|null>} The deleted keyword document or null.
 */
export const deleteKeywordById = async (keywordId) => {
  const keyword = await Keyword.findByIdAndDelete(keywordId);
  if (!keyword) return null;

  const { boardId, imageId } = keyword;
  await Promise.all([
    imageId
      ? Image.findByIdAndUpdate(imageId, { $pull: { keywords: keywordId } })
      : null,
    boardId
      ? Board.findByIdAndUpdate(boardId, { $pull: { keywords: keywordId } })
      : null,
    Thread.deleteMany({ keywordId }),
  ]);

  return keyword;
};

/**
 * Reset all votes and downvotes for all keywords on a board.
 * @param {String} boardId
 * @returns {Promise<Object>} Update result object.
 */
export const resetVotesForBoard = async (boardId) => {
  const result = await Keyword.updateMany(
    { boardId: boardId },
    { $set: { votes: [], downvotes: [] } }
  );
  return result;
};