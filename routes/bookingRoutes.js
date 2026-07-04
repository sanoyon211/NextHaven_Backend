const express = require('express');
const router = express.Router();
const { createCheckoutSession, cancelBooking, getMyBookings, getAllBookings, verifyManualPayment, getBookedDates } = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/bookings/room/:roomId/dates
// Public route to get booked dates for a room
router.get('/room/:roomId/dates', getBookedDates);

// POST /api/bookings/checkout
// Protected route to create a Stripe checkout session
router.post('/checkout', verifyToken, createCheckoutSession);

// POST /api/bookings/verify-payment
// Protected route to verify a manual payment
router.post('/verify-payment', verifyToken, verifyManualPayment);

// PUT /api/bookings/:id/cancel
// Protected route to cancel a booking
router.put('/:id/cancel', verifyToken, cancelBooking);

// GET /api/bookings/my-bookings
// Protected route for users to get their bookings
router.get('/my-bookings', verifyToken, getMyBookings);

// GET /api/bookings
// Protected route for admins to get all bookings
router.get('/', verifyToken, isAdmin, getAllBookings);

module.exports = router;
