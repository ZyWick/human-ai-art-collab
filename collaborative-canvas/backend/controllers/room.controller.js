const roomService = require('../services/roomService');

/**
 * Handle room creation.
 */
const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const room = await roomService.createRoom(name);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle room name update.
 */
const updateRoomName = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { newName } = req.body;
    const updatedRoom = await roomService.updateRoomName(roomId, newName);
    if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle room deletion.
 */
const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const deletedRoom = await roomService.deleteRoom(roomId);
    res.json(deletedRoom);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * Handle joining a room.
 */
const joinRoom = async (req, res) => {
  try {
    const { joinCode } = req.params;
    const room = await roomService.joinRoom(joinCode);
    res.json(room);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await roomService.getRoom(roomId);
    res.json(room);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  updateRoomName,
  deleteRoom,
  joinRoom,
  getRoom
};
