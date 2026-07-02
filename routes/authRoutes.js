const express = require('express');
const router = express.Router();
const { syncUser } = require('../controllers/authController');

// POST /api/auth/sync
router.post('/sync', syncUser);

module.exports = router;
