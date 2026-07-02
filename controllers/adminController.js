const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get Admin Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    // 1. Total revenue from paid bookings using aggregation pipeline
    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 2. Count active bookings (where check-out is in the future and paid)
    const activeBookingsCount = await Booking.countDocuments({
      checkOutDate: { $gte: new Date() },
      paymentStatus: 'paid',
    });

    // 3. Count total rooms
    const totalRoomsCount = await Room.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        activeBookings: activeBookingsCount,
        totalRooms: totalRoomsCount,
      }
    });
  } catch (error) {
    console.error(`Admin Analytics Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to retrieve analytics' });
  }
};

module.exports = { getAnalytics };
