const express = require('express');
const router = express.Router();
const { syncUser, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/sync
router.post('/sync', syncUser);

// GET /api/auth/me
// Get current user profile with points and tier
router.get('/me', verifyToken, getCurrentUser);

module.exports = router;
