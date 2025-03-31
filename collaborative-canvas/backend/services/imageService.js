const Image = require('../models/image.model');
const Keyword = require('../models/keyword.model');
const Board = require('../models/board.model');
const Thread = require('../models/thread.model')
const { deleteS3Image } = require('./s3service');

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
        keywords.forEach(keyword => {
          if (keyword) { // Ensure keyword is valid
            keywordObjects.push({
              boardId: image.boardId,
              imageId: image._id,
              isSelected: false,
              isCustom: false,
              type: category,
              keyword: keyword.trim() // Remove extra spaces
            });
          }
        });
      }
    });
  }

  // Always include "Arrangement" keyword, even if extractedKeywords is empty
  keywordObjects.push({
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    isCustom: false,
    type: "Arrangement",
    keyword: "Arrangement"
  });

  return keywordObjects;
};

  
/**
 * Creates a new image and generates associated keywords.
 * @param {Object} data - Contains boardId, url, x, y, width, height.
 * @returns {Promise<Object>} The created image document with populated keywords.
 */
const createImage = async (data, extractedKeywords) => {
  const image = await Image.create(data);
    const keywordsData = await generateKeywordsForImage(image, extractedKeywords);
    let insertedKeywords = [];
    if (keywordsData.length) {
      insertedKeywords = await Keyword.insertMany(keywordsData);
      image.keywords = insertedKeywords.map(k => k._id);
      await image.save();
    }
  await Board.findByIdAndUpdate(image.boardId, { $push: { images: image._id } });
  return image.populate('keywords');
};

/**
 * Update an image coordinates or dimensions.
 * @param {String} imageId - The image's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const updateImage = async(imageId, updateData) => 
  await Image.findByIdAndUpdate(imageId, updateData, { new: true, runValidators: true });

const updateImageWithChanges = async (update) => {
  const updatedImage = await Image.findByIdAndUpdate(
    update.id, // MongoDB `_id`
    { $set: update.changes }, // Fields to update
    { new: true } // Return the updated document
  );
  return updatedImage;
};

/**
 * Deletes an image and its associated keywords.
 * @param {String} imageId - The image's ObjectId.
 * @returns {Promise<Object>} The deleted image document or null if not found.
 */
const deleteImage = async (imageId) => {
  // Find and delete the image in one step
  const image = await Image.findByIdAndDelete(imageId);
  if (!image) return null;

  // Delete related keywords and threads in parallel
  await Promise.all([
    Keyword.deleteMany({ imageId }),
    Thread.deleteMany({ imageId }),
    image.boardId ? Board.findByIdAndUpdate(image.boardId, { $pull: { images: imageId } }) : null,
    image.url ? deleteS3Image(image.url) : null
  ]);

  return image;
};


module.exports = { createImage, updateImage, updateImageWithChanges, deleteImage };
