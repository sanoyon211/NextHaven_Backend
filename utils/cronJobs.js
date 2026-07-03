const cron = require('node-cron');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const sendEmail = require('./sendEmail');

// Schedule a daily midnight job
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running Automated Housekeeping & Maintenance Cron Job...');
    const currentDate = new Date();

    // Find all bookings where checkOutDate is less than or equal to current date
    const pastBookings = await Booking.find({
      checkOutDate: { $lte: currentDate }
    }).populate('room');

    const roomsToClean = [];

    for (const booking of pastBookings) {
      if (booking.room && booking.room.status !== 'maintenance') {
        // Update room status to 'maintenance'
        booking.room.status = 'maintenance';
        await booking.room.save();

        roomsToClean.push(`- ${booking.room.title}`);
      }
    }

    // If there are rooms to clean, send the task sheet email
    if (roomsToClean.length > 0) {
      const emailSubject = 'Automated Housekeeping Task Sheet';
      const emailText = `The following rooms require cleaning and maintenance today:\n\n${roomsToClean.join('\n')}`;
      const emailHtml = `<h3>Daily Housekeeping Task Sheet</h3><p>The following rooms require cleaning and maintenance today:</p><ul>${roomsToClean.map(r => `<li>${r.substring(2)}</li>`).join('')}</ul>`;
      
      await sendEmail('housekeeping@nexthaven.com', emailSubject, emailText, emailHtml);
      console.log('Housekeeping email sent successfully.');
    } else {
      console.log('No rooms require maintenance today.');
    }
  } catch (error) {
    console.error('Error running automated housekeeping cron job:', error.message);
  }
});
