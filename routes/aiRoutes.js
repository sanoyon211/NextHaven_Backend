const express = require("express");
const router = express.Router();
const { chatWithConcierge } = require("../controllers/aiController");

// POST /api/chat
// Public route for AI Concierge
router.post("/chat", chatWithConcierge);

module.exports = router;
