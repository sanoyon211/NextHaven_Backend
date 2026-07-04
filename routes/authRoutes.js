const express = require('express');
const router = express.Router();
const { syncUser, getCurrentUser, updateProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const uploadImages = require('../middleware/uploadMiddleware');

// POST /api/auth/sync
router.post('/sync', syncUser);

// GET /api/auth/me
// Get current user profile with points and tier
router.get('/me', verifyToken, getCurrentUser);

// PUT /api/auth/profile
// Update user profile (name, avatar)
router.put('/profile', verifyToken, uploadImages.single('avatar'), updateProfile);

// POST /api/auth/logout
// Logout user
router.post('/logout', logout);

module.exports = router;
