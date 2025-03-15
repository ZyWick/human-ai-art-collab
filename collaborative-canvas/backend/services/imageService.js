const Image = require('../models/image.model');
const Keyword = require('../models/keyword.model');
const Board = require('../models/board.model');
const { deleteS3Image } = require('./s3service');
const { getCaption } = require('../utils/imageCaptioning')

/**
 * Generates keywords for an image (Placeholder, replace with actual implementation).
 * @param {Object} image - The image document.
 * @returns {Promise<Array>} Array of keyword objects.
 */
const generateKeywordsForImage = async (image, extractedKeywords) => {
  const keywordObjects = [];

  if(extractedKeywords)
  Object.entries(extractedKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      keywordObjects.push({
        boardId: image.boardId,
        imageId: image._id,      // Optional image reference
        isSelected: false,      // Default value
        isCustom: false,        // Default value
        type: category,         // e.g., "Subject Matter", "Action & Pose", "Theme & Mood"
        keyword: keyword        // The keyword from the array
      });
    });
  });

  keywordObjects.push({
    boardId: image.boardId,
    imageId: image._id,      // Optional image reference
    isSelected: false,      // Default value
    isCustom: false,        // Default value
    type: "Arrangement",         // e.g., "Subject Matter", "Action & Pose", "Theme & Mood"
    keyword: "Arrangement"       // The keyword from the array
  });

  return keywordObjects
}
  
/**
 * Creates a new image and generates associated keywords.
 * @param {Object} data - Contains boardId, url, x, y, width, height.
 * @returns {Promise<Object>} The created image document with populated keywords.
 */
const createImage = async (data, extractedKeywords) => {
  const image = await Image.create(data);

    const keywordsData = await generateKeywordsForImage(image, extractedKeywords);
    if (keywordsData.length) {
      const insertedKeywords = await Keyword.insertMany(keywordsData);
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


/**
 * Deletes an image and its associated keywords.
 * @param {String} imageId - The image's ObjectId.
 * @returns {Promise<Object>} The deleted image document or null if not found.
 */
const deleteImage = async (imageId) => {
  const image = await Image.findById(imageId);
  if (!image) return null;

  await Keyword.deleteMany({ imageId });
  if (image.boardId) await Board.findByIdAndUpdate(image.boardId, { $pull: { images: imageId } });

  if (image.url) await deleteS3Image(image.url);
  return await Image.findByIdAndDelete(imageId);
};

const addFeedback = async (imageId, feedbackData) => {
  const updatedImage = await Image.findByIdAndUpdate(
    imageId,
    { $push: { feedback: feedbackData } },
    { new: true, projection: { feedback: { $slice: -1 } } } // Return only the last added feedback
  );
  return updatedImage ? updatedImage.feedback[0] : null;
};

module.exports = { createImage, updateImage, deleteImage, addFeedback };
