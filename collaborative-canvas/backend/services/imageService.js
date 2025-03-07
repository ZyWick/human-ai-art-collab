const Image = require('../models/image.model');
const Keyword = require('../models/keyword.model');
const Board = require('../models/board.model');
const { deleteS3Image } = require('./s3service');

/**
 * Generates keywords for an image (Placeholder, replace with actual implementation).
 * @param {Object} image - The image document.
 * @returns {Promise<Array>} Array of keyword objects.
 */
const generateKeywordsForImage = async (image) => [
  {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    type: "Subject matter",
    keyword: "sample-keyword-1",
  },
  {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    type: "Subject matter",
    keyword: "samp",
  },
  {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    type: "Subject matter",
    keyword: "sampl323213232rd-1",
  },
  {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    type: "Theme & mood",
    keyword: "sample-keyword-2",
  },
  {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    type: "Action & pose",
    keyword: "sample-keyword-3",
  },
  {
    boardId: image.boardId,
    imageId: image._id,
    isSelected: false,
    type: "Arrangement",
    keyword: "Arrangement",
  },
];

/**
 * Creates a new image and generates associated keywords.
 * @param {Object} data - Contains boardId, url, x, y, width, height.
 * @returns {Promise<Object>} The created image document with populated keywords.
 */
const createImage = async (data) => {
  const image = await Image.create(data);
  
  const keywordsData = await generateKeywordsForImage(image);
  if (keywordsData.length) {
    const insertedKeywords = await Keyword.insertMany(keywordsData);
    image.keywords = insertedKeywords.map(k => k._id);
    await image.save();
  }
  
  await Board.findByIdAndUpdate(data.boardId, { $push: { images: image._id } });
  return image.populate('keywords');
};

/**
 * Update an image coordinates or dimensions.
 * @param {String} imageId - The image's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const updateImage = (imageId, updateData) => 
  Image.findByIdAndUpdate(imageId, updateData, { new: true, runValidators: true });


/**
 * Deletes an image and its associated keywords.
 * @param {String} imageId - The image's ObjectId.
 * @returns {Promise<Object>} The deleted image document or null if not found.
 */
const deleteImage = async (imageId) => {
  const image = await Image.findById(imageId);
  if (!image) return null;

  await Keyword.deleteMany({ imageId });
  if (image.url) await deleteS3Image(image.url);
  return Image.findByIdAndDelete(imageId);
};

module.exports = { createImage, updateImage, deleteImage };
