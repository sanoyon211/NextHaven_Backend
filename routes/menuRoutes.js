const express = require('express');
const router = express.Router();
const { getAllMenuItems } = require('../controllers/menuController');

// GET /api/menu
// Public route to get all menu items or signature items
router.get('/', getAllMenuItems);

module.exports = router;
