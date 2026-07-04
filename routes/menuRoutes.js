const express = require('express');
const router = express.Router();
const { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const uploadImages = require('../middleware/uploadMiddleware');

// GET /api/menu
// Public route to get all menu items or signature items
router.get('/', getAllMenuItems);

// POST /api/menu
// Protected route to create menu item
router.post('/', verifyToken, isAdmin, uploadImages.single('image'), createMenuItem);

// PUT /api/menu/:id
// Protected route to update menu item
router.put('/:id', verifyToken, isAdmin, uploadImages.single('image'), updateMenuItem);

// DELETE /api/menu/:id
// Protected route to delete menu item
router.delete('/:id', verifyToken, isAdmin, deleteMenuItem);

module.exports = router;
