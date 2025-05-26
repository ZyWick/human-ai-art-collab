const express = require('express');
const router = express.Router();
const boardController = require('../controllers/room.controller');

// Get a board by its ID
router.get('/:boardId', boardController.getBoard);

module.exports = router;
