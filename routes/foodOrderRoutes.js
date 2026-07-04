const express = require('express');
const router = express.Router();
const {
  createFoodCheckoutSession,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/foodOrderController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/checkout', verifyToken, createFoodCheckoutSession);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/', verifyToken, isAdmin, getOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
