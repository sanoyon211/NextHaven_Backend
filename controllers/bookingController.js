const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');
const FoodOrder = require('../models/FoodOrder');
const sendEmail = require('../utils/sendEmail');

// @desc    Create Stripe Checkout Session
// @route   POST /api/bookings/checkout
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;
    const userId = req.user._id;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn) || isNaN(checkOut) || checkIn >= checkOut) {
      return res.status(400).json({ message: 'Invalid check-in or check-out dates' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Verify availability (Optimistic locking)
    const overlappingBookings = await Booking.find({
      room: roomId,
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    // Calculate total amount
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.pricePerNight;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: room.title,
              description: room.description,
            },
            unit_amount: totalAmount * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
      metadata: {
        type: 'room_booking',
        roomId: room._id.toString(),
        userId: userId.toString(),
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(`Checkout Session Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// @desc    Handle Stripe Webhook
// @route   POST /api/webhooks/stripe
// @access  Public
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body is raw buffer since we mount express.raw() in server.js
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Signature Verification Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const { type, roomId, userId, checkInDate, checkOutDate, orderId } = session.metadata;

      if (type === 'food_order') {
        // Update FoodOrder record
        const order = await FoodOrder.findById(orderId);
        if (order) {
          order.paymentStatus = 'paid';
          await order.save();
        }
      } else {
        // Default to Room Booking logic
        await Booking.create({
          room: roomId,
          user: userId,
          checkInDate: new Date(checkInDate),
          checkOutDate: new Date(checkOutDate),
          totalAmount: session.amount_total / 100, // Convert back from cents
          paymentStatus: 'paid',
          stripeSessionId: session.id,
        });
      }

      // Update User Loyalty Points and Tier
      try {
        const user = await User.findById(userId);
        if (user) {
          const pointsEarned = Math.floor(session.amount_total / 100); // 1 point per dollar
          user.points = (user.points || 0) + pointsEarned;
          
          if (user.points >= 1000) {
            user.tier = 'Platinum';
          } else if (user.points >= 500) {
            user.tier = 'Gold';
          } else {
            user.tier = 'Silver';
          }
          await user.save();
        }
      } catch (userError) {
        console.error(`Error updating loyalty points: ${userError.message}`);
        // Do not crash the webhook if points fail
      }

    } catch (error) {
      console.error(`Error saving booking to DB: ${error.message}`);
      return res.status(500).send('Internal Server Error');
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send();
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Fetch the booking by req.params.id and populate the 'user' and 'room' fields.
    const booking = await Booking.findById(bookingId).populate('user').populate('room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify that the booking belongs to the currently logged-in user
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update the booking's paymentStatus to 'refunded'
    booking.paymentStatus = 'refunded';

    // Update the associated room's status back to 'available'
    booking.room.status = 'available';

    // Save both the booking and room documents
    await booking.save();
    await booking.room.save();

    // Send confirmation email
    const emailSubject = 'Booking Cancellation Confirmation';
    const emailText = `Hello ${booking.user.name},\n\nYour booking for ${booking.room.title} has been successfully cancelled and your refund is being processed.`;
    const emailHtml = `<h3>Hello ${booking.user.name},</h3><p>Your booking for <strong>${booking.room.title}</strong> has been successfully cancelled and your refund is being processed.</p>`;
    
    await sendEmail(booking.user.email, emailSubject, emailText, emailHtml);

    res.status(200).json({ message: 'Booking successfully cancelled and confirmation email sent' });
  } catch (error) {
    console.error(`Cancel Booking Error: ${error.message}`);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('room').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('room', 'title pricePerNight image').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createCheckoutSession, stripeWebhook, cancelBooking, getMyBookings, getAllBookings };
