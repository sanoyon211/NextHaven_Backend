const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Room = require('../models/Room');
const Booking = require('../models/Booking');

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
      const { roomId, userId, checkInDate, checkOutDate } = session.metadata;

      // Create Booking record
      await Booking.create({
        room: roomId,
        user: userId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        totalAmount: session.amount_total / 100, // Convert back from cents
        paymentStatus: 'paid',
        stripeSessionId: session.id,
      });

      console.log(`Booking created for session: ${session.id}`);
    } catch (error) {
      console.error(`Error saving booking to DB: ${error.message}`);
      return res.status(500).send('Internal Server Error');
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send();
};

module.exports = { createCheckoutSession, stripeWebhook };
