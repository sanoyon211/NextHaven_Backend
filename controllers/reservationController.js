const Reservation = require("../models/Reservation");

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, specialRequests } =
      req.body;

    const reservation = new Reservation({
      user: req.user._id,
      name,
      email,
      phone,
      date,
      time,
      guests,
      specialRequests,
    });

    const createdReservation = await reservation.save();
    res.status(201).json(createdReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged in user reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json({ data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .populate("user", "id name email")
      .sort({ date: -1 });
    res.json({ data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify user owns reservation or is admin
    if (
      reservation.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    reservation.status = status;
    const updatedReservation = await reservation.save();
    res.json(updatedReservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus,
};
