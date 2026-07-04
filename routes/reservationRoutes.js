const express = require('express');
const router = express.Router();
const {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus
} = require('../controllers/reservationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createReservation);
router.get('/my-reservations', verifyToken, getUserReservations);
router.get('/', verifyToken, isAdmin, getAllReservations);
router.put('/:id/status', verifyToken, updateReservationStatus);

module.exports = router;
