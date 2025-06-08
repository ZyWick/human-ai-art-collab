const Image = require("../models/image.model");
const Keyword = require("../models/keyword.model");
const Board = require("../models/board.model");
const Thread = require("../models/thread.model");

/**
 * Create a new thread and update Image/Keyword/Board parentThreads array.
 */
const createThread = async ({ value, userId, username, imageId, keywordId, boardId, parentId, position }) => {
  const newThread = new Thread({
    value,
    userId,
    username,
    boardId,
    imageId: imageId || null,
    keywordId: keywordId || null,
    parentId: parentId || null,
    position: position || { x: null, y: null }
  });

  const savedThread = await newThread.save();
  return savedThread;
};

/**
 * Get all threads for a specific image, keyword, or board.
 */
const getThreadsByParentEntity = async ({ imageId, keywordId, boardId }) => {
  try {
    if (imageId) {
      const image = await Image.findById(imageId).populate("parentThreads");
      return image ? image.parentThreads : [];
    }
    if (keywordId) {
      const keyword = await Keyword.findById(keywordId).populate("parentThreads");
      return keyword ? keyword.parentThreads : [];
    }
    if (boardId) {
      const board = await Board.findById(boardId).populate("parentThreads");
      return board ? board.parentThreads : [];
    }
    return [];
  } catch (error) {
    throw new Error(`Error fetching threads: ${error.message}`);
  }
};

/**
 * Get child threads by their parent ID.
 */
const getThreadsByParent = async (parentId) => {
  try {
    const threads = await Thread.find({ parentId }).sort({ createdAt: 1 }); // Oldest first
    return threads;
  } catch (error) {
    throw new Error(`Error fetching child threads: ${error.message}`);
  }
};

/**
 * Recursively delete a thread and all its child threads.
 * Also removes thread references from related Images, Keywords, and Boards.
 */
const deleteThreadAndChildren = async (parentId) => {
  try {
    // Find all child threads of the given parentId
    const childThreads = await Thread.find({ parentId });

    // Recursively delete each child thread
    for (const child of childThreads) {
      await deleteThreadAndChildren(child._id);
    }

    // Find and remove references from Image, Keyword, and Board collections
    await Image.updateMany({}, { $pull: { parentThreads: parentId } });
    await Keyword.updateMany({}, { $pull: { parentThreads: parentId } });
    await Board.updateMany({}, { $pull: { parentThreads: parentId } });

    // Delete the parent thread itself
    await Thread.findByIdAndDelete(parentId);

    return { success: true, message: `Thread ${parentId} and its children deleted.` };
  } catch (error) {
    throw new Error(`Error deleting threads: ${error.message}`);
  }
};

const updateThreadWithChanges = async (update, updateDate) => {
    const updatedThread = await Thread.findByIdAndUpdate(
      update.id, // MongoDB `_id`
      { $set: update.changes,
        updatedAt: updateDate
       }, // Fields to update
      { new: true } // Return the updated document
    );
    return updatedThread;
};


module.exports = {
  updateThreadWithChanges,
  createThread,
  getThreadsByParentEntity,
  deleteThreadAndChildren,
  getThreadsByParent,
};
