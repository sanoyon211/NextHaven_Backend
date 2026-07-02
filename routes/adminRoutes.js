const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/admin/analytics
// Protected route for admins only to get business analytics
router.get('/analytics', verifyToken, isAdmin, getAnalytics);

module.exports = router;
