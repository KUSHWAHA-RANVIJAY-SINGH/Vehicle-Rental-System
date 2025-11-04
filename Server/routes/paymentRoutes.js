import express from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/payment/create-checkout-session
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('vehicle')
      .populate('user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${booking.vehicle.name} - ${booking.vehicle.brand} ${booking.vehicle.model}`,
              description: `Rental from ${booking.pickupDate.toLocaleDateString()} to ${booking.dropoffDate.toLocaleDateString()}`,
            },
            unit_amount: Math.round(booking.totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/vehicles/${booking.vehicle._id}`,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Save session ID to booking
    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Payment error', error: error.message });
  }
});

// @route   POST /api/payment/confirm
// @desc    Confirm payment after Stripe checkout
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const booking = await Booking.findById(session.metadata.bookingId);

      if (booking) {
        booking.paymentStatus = 'paid';
        booking.paymentIntentId = session.payment_intent;
        booking.status = 'confirmed';
        await booking.save();

        return res.json({ 
          message: 'Payment confirmed',
          booking 
        });
      }
    }

    res.status(400).json({ message: 'Payment not confirmed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Webhook endpoint for Stripe (optional, for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const booking = await Booking.findById(session.metadata.bookingId);

    if (booking) {
      booking.paymentStatus = 'paid';
      booking.paymentIntentId = session.payment_intent;
      booking.status = 'confirmed';
      await booking.save();
    }
  }

  res.json({ received: true });
});

export default router;

