const roomService = require('../services/roomService');
const boardService = require('../services/boardService');


/**
 * Controller to get a board by ID.
 */
const getBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await boardService.getBoard(boardId);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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
  getBoard,
  joinRoom,
  getRoom
};
