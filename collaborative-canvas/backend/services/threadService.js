const Image = require("../models/image.model");
const Keyword = require("../models/keyword.model");
const Board = require("../models/board.model");
const Thread = require("../models/thread.model");

/**
 * Create a new thread and update Image/Keyword/Board parentThreads array.
 */
const createThread = async ({ value, userId, username, imageId, keywordId, boardId, parentId, position }) => {
  try {
    console.log({ value, userId, username, imageId, keywordId, boardId, parentId, position });

    const newThread = new Thread({
      value,
      userId,
      username,
      parentId: parentId || null,
      position: position || null,
    });

    await newThread.save();

    // Update Image, Keyword, or Board to store reference to this thread
    if (parentId) {
      await Thread.findByIdAndUpdate(parentId, { $push: { children: newThread._id } });
    } else {
    const updateOps = { $push: { parentThreads: newThread._id } };
    if (imageId) await Image.findByIdAndUpdate(imageId, updateOps);
    if (keywordId) await Keyword.findByIdAndUpdate(keywordId, updateOps);
    if (boardId) await Board.findByIdAndUpdate(boardId, updateOps);
    }

    return newThread;
  } catch (error) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
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

module.exports = {
  createThread,
  getThreadsByParentEntity,
  deleteThreadAndChildren,
  getThreadsByParent,
};
