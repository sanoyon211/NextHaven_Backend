const express = require('express');
const router = express.Router();
const { createCheckoutSession, cancelBooking } = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/bookings/checkout
// Protected route to create a Stripe checkout session
router.post('/checkout', verifyToken, createCheckoutSession);

// PUT /api/bookings/:id/cancel
// Protected route to cancel a booking
router.put('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;
