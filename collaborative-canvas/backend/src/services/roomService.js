import mongoose from 'mongoose';

// Import local modules relatively, with file extension
import Room from '../models/room.model.js';
import{createBoard, deleteBoardById} from './boardService.js';
import {generateCode} from '../utils/helpers.js'

/**
 * Create a new room with a blank board.
 * @param {string} name - The name of the room.
 * @returns {Promise<Object>} The created room.
 */
export const createRoomWithName = async (name) => {
  const joinCode = generateCode(6);

  const room = await Room.create({ name, joinCode, boards: [] });
  const blankBoard = await createBoard({ 
    name: 'draft 1', 
    roomId: room._id, 
    images: [],
  });

  await Room.findByIdAndUpdate(room._id, {
    $push: { boards: blankBoard._id },
  });
  return room;
};

/**
 * Update a room's name.
 * @param {string} roomId
 * @param {string} newName
 * @returns {Promise<Object|null>}
 */
export const updateRoomName = async (roomId, newName) => {
  if (!mongoose.Types.ObjectId.isValid(roomId))
    throw new Error('Invalid room ID');
  return await Room.findByIdAndUpdate(
    roomId,
    { name: newName },
    { new: true }
  ).lean();
};

/**
 * Delete a room and its associated boards.
 * @param {string} roomId
 * @returns {Promise<Object>}
 */
export const deleteRoomById = async (roomId) => {
  if (!mongoose.Types.ObjectId.isValid(roomId))
    throw new Error('Invalid room ID');

  const room = await Room.findById(roomId).lean();
  if (!room) throw new Error('Room not found');

  await Promise.all(room.boards.map(deleteBoardById));
  await Room.findByIdAndDelete(roomId);

  return room;
};

/**
 * Find a room and populate its boards.
 * @param {Object} query - Mongoose query object
 * @returns {Promise<Object|null>}
 */
const findRoomWithBoards = (query) => 
  Room.findOne(query).populate('boards').lean();

/**
 * Join a room using a join code.
 * @param {string} joinCode
 * @returns {Promise<Object>}
 * @throws {Error} if room not found
 */
export const findRoomAndPopulateBoardByCode = (joinCode) =>
  findRoomWithBoards({ joinCode });

/**
 * Get room by ID and populate its boards.
 * @param {string} roomId
 * @returns {Promise<Object|null>}
 */
export const findRoomAndPopulateBoardById = (_id) =>
  findRoomWithBoards({ _id });

/**
 * Updates the designDetails of a specific room.
 * @param {string} roomId - The ID of the room to update.
 * @param {Object} designUpdates - The updated designDetails fields.
 * @returns {Promise<Object>} - The updated room's designDetails.
 */
export const updateDesignDetailsDb = async (roomId, designUpdates) => {
  const [[field, value]] = Object.entries(designUpdates);
  const updatedRoom = await Room.findOneAndUpdate(
    { _id: roomId },
    { $set: { [`designDetails.${field}`]: value } },
    { new: true, lean: true }
  );
  return updatedRoom.designDetails;
};

