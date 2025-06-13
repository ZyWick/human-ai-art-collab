import { findBoardById } from '../services/boardService.js';
import { isValidObjectId } from '../utils/objectId.js';
import { errorResponse, logError } from '../utils/error.js';

export async function getBoard(req, res) {
  try {
    const { boardId } = req.params;
    if (!isValidObjectId(boardId)) return errorResponse(res, 400, 'Invalid boardId format');
    const board = await findBoardById(boardId);
    if (!board) return errorResponse(res, 404, 'Board not found');
    return res.json(board);
  } catch (err) {
    logError('getBoard', err);
    return errorResponse(res, 500, 'Server error while fetching board');
  }
}