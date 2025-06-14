import express from 'express';
import { getBoard } from '../controllers/board.controller.js';

/**
 * Router for board-related endpoints.
 * 
 * GET /:boardId - Fetches a board by its ID.
 */
const router = express.Router();

// Get a board by its ID
router.get('/:boardId', getBoard);

// Exporting the router as the default export (ESM style)
export default router;