const Keyword = require("../models/keyword.model");
const Image = require("../models/image.model");
const Board = require("../models/board.model");
const Thread = require("../models/thread.model");
const { getCaption } = require("../utils/imageCaptioning");
const { extractKeywords } = require("../utils/llm");

const generateKeywords = async (
  io,
  progressCounter,
  imageId,
  roomId,
  files
) => {
  const captions = await Promise.all(
    files.map(async (segment, idx) => {
      try {
        const caption = await getCaption(segment.buffer);
        return caption;
      } catch (err) {
        console.error(`Caption generation failed for segment #${idx}:`, err);
        return null;
      } finally {
        progressCounter.add(4.5);
      }
    })
  );
  const Caption = captions.filter(Boolean);

  // 2b) Extract keywords (tolerate failure)
  let keywords =  {};
  if (Caption.length) {
    try {
      keywords = await extractKeywords(JSON.stringify({ Caption }, null, 2));
    } catch (err) {
      console.error("Keyword extraction failed:", err);
      // leave keywords = []
    }
  }

  progressCounter.add(15);

  // 2c) Insert keywords & link to image (tolerate DB failure)
  let newKeywords = {};
  if (keywords && typeof keywords === "object") {
    try {
      newKeywords = await addKeywordsToImage(imageId, keywords);
    } catch (err) {
      console.error("Saving keywords to DB failed:", err);
      // leave newKeywords = []
    }
  }

  progressCounter.add(5);

  newKeywords.forEach((keyword) => {
    io.to(roomId).emit("newKeyword", { keyword });
  });

  progressCounter.add(5);
};

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

/**
 * Generates keywords for an image (Placeholder, replace with actual implementation).
 * @param {Object} image - The image document.
 * @returns {Promise<Array>} Array of keyword objects.
 */
const generateKeywordsForImage = async (image, extractedKeywords) => {
  const keywordObjects = [];

  if (extractedKeywords && typeof extractedKeywords === "object") {
    Object.entries(extractedKeywords).forEach(([category, keywords]) => {
      if (Array.isArray(keywords) && keywords.length) {
        keywords.forEach((keyword) => {
          if (keyword) {
            // Ensure keyword is valid
            keywordObjects.push({
              boardId: image.boardId,
              imageId: image._id,
              isSelected: false,
              isCustom: false,
              type: category,
              keyword: keyword.trim(), // Remove extra spaces
            });
          }
        });
      }
    });
  }

  // Always include "Arrangement" keyword, even if extractedKeywords is empty
  // keywordObjects.push({
  //   boardId: image.boardId,
  //   imageId: image._id,
  //   isSelected: false,
  //   isCustom: false,
  //   type: "Arrangement",
  //   keyword: "Arrangement"
  // });

  return keywordObjects;
};

const addArrangementToImage = async (imageId, boundingBoxes) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error("Image not found");

  // Construct the keyword object
  const keywordData = {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    isCustom: false,
    type: "Arrangement", // or any type you need
    keyword: "Arrangement",
    boundingBoxes,
  };
  
  // Insert the keyword
  const insertedKeyword = await Keyword.create(keywordData);

  // Update the image's keyword references
  image.keywords.push(insertedKeyword._id);
  await image.save();

  return insertedKeyword;
};


const addKeywordsToImage = async (imageId, extractedKeywords) => {
  const image = await Image.findById(imageId);
  if (!image) throw new Error("Image not found");

  const keywordsData = await generateKeywordsForImage(image, extractedKeywords);
  let insertedKeywords = [];

  if (keywordsData.length) {
    insertedKeywords = await Keyword.insertMany(keywordsData);
    image.keywords = insertedKeywords.map((k) => k._id);
    await image.save();
  }

  return insertedKeywords;
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
  );

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
  return await keyword.updateOne(
    { isSelected: !keyword.isSelected },
    { new: true }
  );
};

/**
 * Delete a keyword.
 * @param {String} keywordId - The keyword's ObjectId.
 * @returns {Promise<Object|null>} The deleted keyword document or null if not found.
 */
const deleteKeyword = async (keywordId) => {
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

const resetVotesForBoard = async (boardId) => {
  const result = await Keyword.updateMany(
    { boardId: boardId }, // Filter: Only keywords with this boardId
    { $set: { votes: [], downvotes: [] } } // Reset both votes and downvotes
  );

  return result;
};

module.exports = {
  getKeyword,
  generateKeywords,
  createKeyword,
  addKeywordsToImage,
  // updateKeyword,
  removeKeywordFromBoard,
  toggleKeywordSelection,
  deleteKeyword,
  updateKeywordVotes,
  resetVotesForBoard,
  updateKeywordWithChanges,
  addArrangementToImage
};
