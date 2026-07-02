const express = require('express');
const router = express.Router();
const { stripeWebhook } = require('../controllers/bookingController');

// POST /api/webhooks/stripe
// Note: This route expects a raw body (buffer), which is configured in server.js
router.post('/stripe', stripeWebhook);

module.exports = router;
