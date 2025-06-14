import Image from '../models/image.model.js';
import Keyword from '../models/keyword.model.js';
import Board from '../models/board.model.js';
import Thread from '../models/thread.model.js';

/**
 * Create a new thread and update Image/Keyword/Board parentThreads array.
 * @param {Object} params
 * @param {string} params.value
 * @param {string} params.userId
 * @param {string} params.username
 * @param {string} [params.imageId]
 * @param {string} [params.keywordId]
 * @param {string} [params.boardId]
 * @param {string} [params.parentId]
 * @param {{x: number|null, y: number|null}} [params.position]
 * @returns {Promise<import('../models/thread.model.js').default>}
 */
export const createThread = async ({ value, userId, username, imageId, keywordId, boardId, parentId, position }) => {
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
 * @param {Object} params
 * @param {string} [params.imageId]
 * @param {string} [params.keywordId]
 * @param {string} [params.boardId]
 * @returns {Promise<Array<import('../models/thread.model.js').default>>}
 */
export const getThreadsByParentEntity = async ({ imageId, keywordId, boardId }) => {
  try {
    if (imageId) {
      const image = await Image.findById(imageId).populate('parentThreads');
      return image ? image.parentThreads : [];
    }
    if (keywordId) {
      const keyword = await Keyword.findById(keywordId).populate('parentThreads');
      return keyword ? keyword.parentThreads : [];
    }
    if (boardId) {
      const board = await Board.findById(boardId).populate('parentThreads');
      return board ? board.parentThreads : [];
    }
    return [];
  } catch (error) {
    throw new Error(`Error fetching threads: ${error.message}`);
  }
};

/**
 * Get child threads by their parent ID.
 * @param {string} parentId
 * @returns {Promise<Array<import('../models/thread.model.js').default>>}
 */
export const getThreadsByParent = async (parentId) => {
  try {
    const threads = await Thread.find({ parentId }).sort({ createdAt: 1 });
    return threads;
  } catch (error) {
    throw new Error(`Error fetching child threads: ${error.message}`);
  }
};

/**
 * Recursively delete a thread and all its child threads.
 * Also removes thread references from related Images, Keywords, and Boards.
 * @param {string} parentId
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteThreadAndChildren = async (parentId) => {
  try {
    // Find all child threads of the given parentId
    const childThreads = await Thread.find({ parentId });

    // Recursively delete each child thread
    for (const child of childThreads) {
      await deleteThreadAndChildren(child._id);
    }

    // Remove references from Image, Keyword, and Board collections
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

/**
 * Updates a thread by its ID.
 * @param {Object} update
 * @param {string} update.id
 * @param {Object} update.changes
 * @param {Date} updateDate
 * @returns {Promise<import('../models/thread.model.js').default>}
 */
export const updateThreadWithChanges = async (update, updateDate) => {
  const updatedThread = await Thread.findByIdAndUpdate(
    update.id,
    {
      $set: update.changes,
      updatedAt: updateDate
    },
    { new: true }
  );
  return updatedThread;
};