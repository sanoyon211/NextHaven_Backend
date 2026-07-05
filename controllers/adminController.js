const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");

// @desc    Get Admin Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    // 1. Total revenue from paid bookings using aggregation pipeline
    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue =
      revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 2. Count active bookings (where check-out is in the future and paid)
    const activeBookingsCount = await Booking.countDocuments({
      checkOutDate: { $gte: new Date() },
      paymentStatus: "paid",
    });

    // 3. Count available rooms
    const today = new Date();

    // Get all paid bookings overlapping today
    const occupiedBookings = await Booking.find({
      checkInDate: { $lte: today },
      checkOutDate: { $gt: today },
      paymentStatus: "paid",
    });

    // Get unique room IDs that are occupied
    const occupiedRoomIds = [
      ...new Set(occupiedBookings.map((b) => b.room.toString())),
    ];

    // Find rooms that are marked 'available' but are NOT in the occupied list
    const availableRoomsCount = await Room.countDocuments({
      status: "available",
      _id: { $nin: occupiedRoomIds },
    });

    // 4. Count total rooms
    const totalRoomsCount = await Room.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        activeBookings: activeBookingsCount,
        availableRooms: availableRoomsCount,
        totalRooms: totalRoomsCount,
      },
    });
  } catch (error) {
    console.error(`Admin Analytics Error: ${error.message}`);
    res.status(500).json({ message: "Failed to retrieve analytics" });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(`Get All Users Error: ${error.message}`);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Prevent invalid roles
    if (!["guest", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional safeguard: prevent changing own role to prevent locking oneself out
    // Since the plan mentioned this, let's check it.
    if (req.user._id.toString() === user._id.toString() && role === "guest") {
      return res
        .status(400)
        .json({ message: "You cannot revoke your own admin access" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(`Update User Role Error: ${error.message}`);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

module.exports = { getAnalytics, getAllUsers, updateUserRole };
