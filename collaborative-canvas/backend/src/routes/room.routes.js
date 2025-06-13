// Import express and the room controller using ESM syntax
import express from 'express';
import {createRoom, joinRoom, getRoom} from '../controllers/room.controller.js'; // Ensure extension when importing locally

const router = express.Router();

/**
 * @route POST /create
 * @desc Create a new room
 */
router.post('/create', createRoom);

/**
 * @route GET /join/:joinCode
 * @desc Join a room using a join code
 */
router.get('/join/:joinCode', joinRoom);

/**
 * @route GET /:roomId
 * @desc Get information about a specific room
 */
router.get('/:roomId', getRoom);

// Export the router as the default export for ESM
export default router;