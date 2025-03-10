const crypto = require('crypto');
const mongoose = require('mongoose');
const Room = require('../models/room.model');
const boardService = require('./boardService');

/**
 * Generate a secure join code.
 */
const generateJoinCode = () => crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();

/**
 * Create a new room with a blank board.
 */
const createRoom = async (name) => {
  const joinCode = generateJoinCode();

  const room = await Room.create({ name, joinCode, boards: [] });
  const blankBoard = await boardService.createBoard({ 
    name: 'draft 1', 
    roomId: room._id, 
    images: [] 
  });

  await Room.findByIdAndUpdate(room._id, { $push: { boards: blankBoard._id } });
  return room;
};

/**
 * Update a room's name.
 */
const updateRoomName = async (roomId, newName) => {
  if (!mongoose.Types.ObjectId.isValid(roomId)) throw new Error('Invalid room ID');
  return await Room.findByIdAndUpdate(roomId, { name: newName }, { new: true }).lean();
};

/**
 * Delete a room and its associated boards.
 */
const deleteRoom = async (roomId) => {
  if (!mongoose.Types.ObjectId.isValid(roomId)) throw new Error('Invalid room ID');

  const room = await Room.findById(roomId).lean();
  if (!room) throw new Error('Room not found');

  await Promise.all(room.boards.map(boardService.deleteBoard));
  await Room.findByIdAndDelete(roomId);

  return room;
};

/**
 * Join a room using a join code.
 */
const joinRoom = async (joinCode) => {
  const room = await Room.findOne({ joinCode })
    .populate({
      path: 'boards'});

  if (!room) throw new Error('Room not found');
  return room;
};

const getRoom = async (roomId) => {
  const room = await Room.findById(roomId)
    .populate({
      path: 'boards'});

  if (!room) throw new Error('Room not found');
  return room;
};

module.exports = {
  getRoom,
  createRoom,
  updateRoomName,
  deleteRoom,
  joinRoom,
};
