const express = require('express');
const router = express.Router();
const { createRoom, getAllRooms, getRoomById, updateRoomStatus } = require('../controllers/roomController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const uploadImages = require('../middleware/uploadMiddleware');

// POST /api/rooms
// Protected route: check authentication, check admin role, then handle up to 5 image uploads
router.post('/', verifyToken, isAdmin, uploadImages.array('images', 5), createRoom);

// GET /api/rooms
// Public route to get all rooms with search, filter, and availability
router.get('/', getAllRooms);

// GET /api/rooms/:id
// Public route to get single room
router.get('/:id', getRoomById);

// PUT /api/rooms/:id/status
// Protected route to update room status
router.put('/:id/status', verifyToken, isAdmin, updateRoomStatus);

module.exports = router;
