const express = require('express');
const router = express.Router();
const { getAnalytics, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/admin/analytics
// Protected route for admins only to get business analytics
router.get('/analytics', verifyToken, isAdmin, getAnalytics);

// GET /api/admin/users
// Protected route to get all registered users
router.get('/users', verifyToken, isAdmin, getAllUsers);

// PUT /api/admin/users/:id/role
// Protected route to update a user's role
router.put('/users/:id/role', verifyToken, isAdmin, updateUserRole);

module.exports = router;
