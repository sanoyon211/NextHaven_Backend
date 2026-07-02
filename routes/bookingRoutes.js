const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/bookings/checkout
// Protected route to create a Stripe checkout session
router.post('/checkout', verifyToken, createCheckoutSession);

module.exports = router;
