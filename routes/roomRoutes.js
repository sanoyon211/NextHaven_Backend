const express = require('express');
const router = express.Router();
const { createRoom } = require('../controllers/roomController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const uploadImages = require('../middleware/uploadMiddleware');

// POST /api/rooms
// Protected route: check authentication, check admin role, then handle up to 5 image uploads
router.post('/', verifyToken, isAdmin, uploadImages.array('images', 5), createRoom);

module.exports = router;
