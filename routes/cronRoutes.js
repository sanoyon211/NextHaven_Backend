const express = require("express");
const router = express.Router();
const { runHousekeeping } = require("../controllers/cronController");

// @route   GET /api/cron/housekeeping
// @desc    Trigger automated housekeeping tasks (called by Vercel)
// @access  Public / Cron
router.get("/housekeeping", runHousekeeping);

module.exports = router;
