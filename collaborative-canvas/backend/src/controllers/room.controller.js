import {
  createRoomWithName,
  findRoomAndPopulateBoardByCode,
  findRoomAndPopulateBoardById,
} from '../services/roomService.js';
import { z } from 'zod';
import { MAX_ROOM_NAME_LEN } from '../constants/index.js';
import { errorResponse, logError } from '../utils/error.js';
import { isValidObjectId } from '../utils/objectId.js';
/**
 * Zod schemas for strong validation.
 */
const roomNameSchema = z.object({
  name: z.string().trim().min(1).max(MAX_ROOM_NAME_LEN),
});

/**
 * Validate a join code (e.g., 3-20 alphanumeric, dash/underscore allowed).
 * @param {string} code
 * @returns {boolean}
 */
export function isValidJoinCode(code) {
  return typeof code === 'string' && /^[A-Za-z0-9_-]{3,20}$/.test(code);
}


/**
 * POST Create Room -- with safe body parsing.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createRoom(req, res) {
  try {
    const parsed = roomNameSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, `name is required (min 1, max ${MAX_ROOM_NAME_LEN} chars)`);
    }
    const { name } = parsed.data;
    const room = await createRoomWithName(name);
    return res.status(201).json(room);
  } catch (error) {
    logError('createRoom', error);
    return errorResponse(res, 500, 'Server error while creating room');
  }
}

/**
 * GET Join Room by Code -- defensive input, clear output.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function joinRoom(req, res) {
  try {
    const { joinCode } = req.params;
    if (!isValidJoinCode(joinCode)) {
      return errorResponse(res, 400, 'Invalid join code');
    }
    const room = await findRoomAndPopulateBoardByCode(joinCode);
    if (!room) return errorResponse(res, 404, 'Room not found');
    return res.json(room);
  } catch (error) {
    logError('joinRoom', error);
    return errorResponse(res, 500, 'Server error while joining room');
  }
}

/**
 * GET Room (populated) by Id, strict input.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getRoom(req, res) {
  try {
    const { roomId } = req.params;
    if (!isValidObjectId(roomId)) {
      return errorResponse(res, 400, 'Invalid roomId format');
    }
    const room = await findRoomAndPopulateBoardById(roomId);
    if (!room) return errorResponse(res, 404, 'Room not found');
    return res.json(room);
  } catch (error) {
    logError('getRoom', error);
    return errorResponse(res, 500, 'Server error while fetching room');
  }
}
