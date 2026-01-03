import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const instance = new Razorpay({
         key_id: process.env.RAZORPAY_KEY_ID,
         key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/bookings/create-order
// @access  Private
export const createOrder = async (req, res) => {
         try {
                  const { amount, currency = 'INR', receipt } = req.body;

                  const options = {
                           amount: amount * 100, // amount in smallest currency unit
                           currency,
                           receipt,
                  };

                  const order = await instance.orders.create(options);

                  if (!order) {
                           return res.status(500).send('Some error occured');
                  }

                  res.json(order);
         } catch (error) {
                  res.status(500).send(error);
         }
};

import Booking from '../models/Booking.js';

// @desc    Verify Razorpay Payment
// @route   POST /api/bookings/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
         try {
                  const {
                           razorpay_order_id,
                           razorpay_payment_id,
                           razorpay_signature,
                           bookingId // Received from frontend
                  } = req.body;

                  const body = razorpay_order_id + '|' + razorpay_payment_id;

                  const expectedSignature = crypto
                           .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                           .update(body.toString())
                           .digest('hex');

                  const isAuthentic = expectedSignature === razorpay_signature;

                  if (isAuthentic) {
                           // Update booking status
                           const booking = await Booking.findById(bookingId);
                           if (booking) {
                                    booking.paymentStatus = 'paid';
                                    booking.status = 'confirmed';
                                    booking.paymentIntentId = razorpay_payment_id;
                                    booking.stripeSessionId = razorpay_order_id; // Using this field for order_id for now or create new field
                                    await booking.save();
                           }

                           res.json({
                                    success: true,
                                    message: 'Payment has been verified',
                                    bookingId: booking.bookingId
                           });
                  } else {
                           res.status(400).json({
                                    success: false,
                                    message: 'Invalid signature',
                           });
                  }
         } catch (error) {
                  res.status(500).send(error);
         }
};
