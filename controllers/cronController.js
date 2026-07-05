const Booking = require("../models/Booking");
const Room = require("../models/Room");
const sendEmail = require("../utils/sendEmail");

// @desc    Run automated housekeeping tasks (called by Vercel Cron)
// @route   GET /api/cron/housekeeping
// @access  Public (should ideally be protected with a secret header in production)
exports.runHousekeeping = async (req, res) => {
  try {
    console.log("Running Automated Housekeeping & Maintenance Cron API...");
    
    // Optional: Protect this route from public access using an Authorization header configured in Vercel
    if (
      process.env.CRON_SECRET &&
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return res.status(401).json({ message: "Unauthorized access to cron endpoint" });
    }

    const currentDate = new Date();

    // Find all bookings where checkOutDate is less than or equal to current date
    const pastBookings = await Booking.find({
      checkOutDate: { $lte: currentDate },
    }).populate("room");

    const roomsToClean = [];

    for (const booking of pastBookings) {
      if (booking.room && booking.room.status !== "available") {
        // Update room status to 'available'
        booking.room.status = "available";
        await booking.room.save();

        roomsToClean.push(`- ${booking.room.title}`);
      }
    }

    // If there are rooms to clean, send the task sheet email
    if (roomsToClean.length > 0) {
      const emailSubject = "Automated Housekeeping Task Sheet";
      const emailText = `The following rooms require cleaning and maintenance today:\n\n${roomsToClean.join("\n")}`;
      const emailHtml = `<h3>Daily Housekeeping Task Sheet</h3><p>The following rooms require cleaning and maintenance today:</p><ul>${roomsToClean
        .map((r) => `<li>${r.substring(2)}</li>`)
        .join("")}</ul>`;

      await sendEmail(
        "housekeeping@nexthaven.com",
        emailSubject,
        emailText,
        emailHtml
      );
      console.log("Housekeeping email sent successfully.");
    } else {
      console.log("No rooms require maintenance today.");
    }

    return res.status(200).json({
      success: true,
      message: "Housekeeping cron job executed successfully.",
      roomsCleaned: roomsToClean.length,
    });
  } catch (error) {
    console.error("Error running automated housekeeping cron API:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during cron execution.",
    });
  }
};
