const Image = require("../models/image.model");
const Keyword = require("../models/keyword.model");
const Board = require("../models/board.model");
const Thread = require("../models/thread.model");
const { uploadS3Image, deleteS3Image } = require("./s3service");
const keywordService = require("./keywordService");

const { sendBufferImageToSAM } = require("../utils/imageSegmentation");

const createImage = async (data) => {
  const image = await Image.create(data);
  await Board.findByIdAndUpdate(image.boardId, {
    $push: { images: image._id },
  });
  return image; // Do not populate keywords yet
};

/**
 * Update an image coordinates or dimensions.
 * @param {String} imageId - The image's ObjectId.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object|null>} The updated keyword document or null if not found.
 */
const updateImage = async (imageId, updateData) =>
  await Image.findByIdAndUpdate(imageId, updateData, {
    new: true,
    runValidators: true,
  });

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
    image.boardId
      ? Board.findByIdAndUpdate(image.boardId, { $pull: { images: imageId } })
      : null,
    image.url ? deleteS3Image(image.url) : null,
  ]);

  return image;
};

const uploadImage = (users, io) => async (req, res) => {
  try {
    if (!isValidFileCount(req.files)) {
      return res
        .status(400)
        .json({ error: "Expected 10 images (1 full + 9 segments)" });
    }

    const fullImage = req.files[0];
    const { width, height, x, y } = req.body;
    const boardId = req.headers["board-id"];
    const socketId = req.headers["socket-id"];
    const user = users[socketId];
    if (!user) {
      return res.status(401).json({ error: "Invalid socket‑id" });
    }

    const uploadId = generateUploadId();
    const progressCounter = createUploadProgressCounter(io, socketId, uploadId, fullImage.originalname);

    const uploadResult = await tryUploadToS3(fullImage, res);
    if (!uploadResult) return;

    progressCounter.add(10);

    const imageDoc = await tryCreateImage(
      boardId,
      uploadResult.url,
      fullImage.originalname,
      { width, height, x, y },
      res
    );
    if (!imageDoc) return;

    progressCounter.add(5);
    notifyClients(io, user, imageDoc); 
    
    segementImage(fullImage, io, imageDoc._id, user.roomId, progressCounter);
    startKeywordGeneration(io, progressCounter, imageDoc._id, user.roomId, req.files);

    return res.status(201).json({
      message: "Image uploaded",
      url: uploadResult.url,
      image: imageDoc,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- Helpers ---

const isValidFileCount = (files) => files && files.length === 10;

const generateUploadId = () => Math.floor(Math.random() * 1_000_000);

function createUploadProgressCounter(io, socketId, uploadId, fileName) {
  let count = 0;

  // Emit initial progress start event
  io.to(socketId).emit("addUploadProgress", {
    uploadId,
    fileName,
  });

  return {
    add: (up = 1) => {
      count += up;
      io.to(socketId).emit("updateUploadProgress", {
        uploadId,
        progress: count,
      });
    }
  };
}


const tryUploadToS3 = async (file, res) => {
  try {
    return await uploadS3Image(file);
  } catch (err) {
    console.error("❌ S3 upload failed:", err);
    res.status(502).json({ error: "Image storage failed" });
    return null;
  }
};

const tryCreateImage = async (boardId, url, filename, dimensions, res) => {
  try {
    const { x, y, width, height } = dimensions;
    return await createImage({ boardId, url, filename, x, y, width, height });
  } catch (err) {
    console.error("❌ Saving image to DB failed:", err);
    res.status(500).json({ error: "Saving image failed" });
    return null;
  }
};

const segementImage = async (fullImage, io, imageId, roomId, progressCounter, res) => {
  try {
    const result = await sendBufferImageToSAM(fullImage.buffer, fullImage.originalname, fullImage.mimetype);
    const ArrangementKW = await keywordService.addArrangementToImage(imageId, result)
    io.to(roomId).emit("newKeyword", {keyword: ArrangementKW })
    return result;
  } catch (err) {
    console.error("❌ Segmenting Image failed:", err);
    return null;
  } finally {
    progressCounter.add(15);
  }
}

const notifyClients = (io, user, imageDoc) => {
  io.to(user.roomId).emit("newImage", {
    image: imageDoc,
    user: { id: user.userId, name: user.username },
  });
};

const startKeywordGeneration = (
  io,
  progressCounter,
  imageId,
  roomId,
  files
) => {
  keywordService
    .generateKeywords(io, progressCounter, imageId, roomId, files)
    .catch((err) => {
      console.error("❌ generateKeywords encountered an unhandled error:", err);
    });
};


module.exports = {
  updateImage,
  updateImageWithChanges,
  deleteImage,
  uploadImage,
};
