const express = require('express');
const roomController = require('../controllers/room.controller');

const router = express.Router();

router.post('/create', roomController.createRoom);
router.get('/join/:joinCode', roomController.joinRoom);
router.get('/:roomId', roomController.getRoom);


module.exports = router;
