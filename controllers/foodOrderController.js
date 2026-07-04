const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const FoodOrder = require('../models/FoodOrder');
const Menu = require('../models/Menu');
const Booking = require('../models/Booking');

// @desc    Create Stripe Checkout Session for Food Order
// @route   POST /api/food-orders/checkout
// @access  Private
const createFoodCheckoutSession = async (req, res) => {
  try {
    const { items, deliveryLocation, orderNotes } = req.body;
    const userId = req.user._id;

    // Check if user has an active room booking
    const activeBooking = await Booking.findOne({
      user: userId,
      paymentStatus: 'paid',
      checkOutDate: { $gte: new Date() }
    });

    if (!activeBooking) {
      return res.status(403).json({ message: 'You must have an active room booking to order food.' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryLocation) {
      return res.status(400).json({ message: 'Please provide a delivery location (e.g. Room 101 or Table 5)' });
    }

    let totalAmount = 0;
    const line_items = [];
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }

      // Handle cases where price is a string like "$12.99"
      let price = menuItem.price;
      if (typeof price === 'string') {
        price = parseFloat(price.replace(/[^0-9.-]+/g, ''));
      }

      totalAmount += price * item.quantity;

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: menuItem.name,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      });

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: price,
        quantity: item.quantity,
      });
    }

    // Create a temporary order to store items, or pass items in metadata if possible.
    // Stripe metadata is limited in size (500 chars per value), so we'll store the items as JSON if small,
    // or better yet, just pass a unique orderId. Let's create the FoodOrder as 'pending' first.
    
    const newOrder = await FoodOrder.create({
      user: userId,
      items: orderItems,
      deliveryLocation,
      orderNotes,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'preparing', // defaults
      stripeSessionId: 'pending', // update later
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Ensure it's an integer in cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
        type: 'food_order',
      },
    });

    // Update session id
    newOrder.stripeSessionId = paymentIntent.id;
    await newOrder.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret, amount: totalAmount });
  } catch (error) {
    console.error(`Food Checkout Session Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// @desc    Get user's food orders
// @route   GET /api/food-orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.find({ user: req.user._id, paymentStatus: { $ne: 'pending' } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all food orders
// @route   GET /api/food-orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.find({ paymentStatus: { $ne: 'pending' } }).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update order status
// @route   PUT /api/food-orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await FoodOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createFoodCheckoutSession,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};
