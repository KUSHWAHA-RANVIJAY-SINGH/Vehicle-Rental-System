import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import { protect, admin, authenticatePartner } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { calculateSurge } from '../utils/pricing.js'; // Import here
import { sendBookingConfirmation } from '../utils/sendEmail.js';

const router = express.Router();

// @desc    Create a new booking
// @access  Private
router.post('/create-order', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, [
  body('vehicle').notEmpty().withMessage('Vehicle ID is required'),
  body('pickupDate').isISO8601().withMessage('Valid pickup date is required'),
  body('dropoffDate').isISO8601().withMessage('Valid dropoff date is required'),
  body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
  body('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
  body('rentalTier').optional().isString(),
  body('bookingType').optional().isIn(['day', 'km'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user has uploaded documents
    if (!req.user.drivingLicense || !req.user.aadharCard) {
      return res.status(400).json({
        message: 'Please upload your Driving License and Aadhar Card in your profile before booking.'
      });
    }

    const { vehicle, pickupDate, dropoffDate, pickupLocation, dropoffLocation } = req.body;

    // Check if vehicle exists and is available
    const vehicleData = await Vehicle.findById(vehicle);
    if (!vehicleData) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!vehicleData.available) {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    // Prevent overlapping bookings for the same vehicle
    // Overlap condition (day-level): existing.pickupDate < newDropoff && existing.dropoffDate > newPickup
    // This allows back-to-back bookings where new pickup === existing dropoff (no overlap)
    // Note: This is a fast server-side check but not a full-proof lock; to avoid rare race conditions
    // (two users booking the same car at the same time) consider using MongoDB transactions
    // or an external reservation lock (Redis) in production.
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);

    const conflictingBooking = await Booking.findOne({
      vehicle,
      status: { $in: ['pending', 'confirmed'] },
      $and: [
        { pickupDate: { $lt: dropoff } },
        { dropoffDate: { $gt: pickup } }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({
        message: 'Vehicle is already booked for the selected dates',
        conflict: {
          id: conflictingBooking._id,
          pickupDate: conflictingBooking.pickupDate,
          dropoffDate: conflictingBooking.dropoffDate
        }
      });
    }


    // Calculate total price
    const diffTime = Math.abs(dropoff - pickup);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Get Surge Multiplier
    const surgeData = await calculateSurge(vehicleData, pickup, dropoff);
    const surgeMultiplier = surgeData.multiplier;


    // Calculate daily rate based on tier
    let dailyRate = vehicleData.pricePerDay;
    const { rentalTier, withDriver, bookingType } = req.body;

    // Use usage-based logic matching frontend
    // Tiers: limit120 (85%), limit300 (100%), unlimited (130%)
    if (rentalTier === 'limit120') {
      dailyRate = Math.round(vehicleData.pricePerDay * 0.85);
    } else if (rentalTier === 'limit300') {
      dailyRate = Math.round(vehicleData.pricePerDay * 1.0);
    } else if (rentalTier === 'unlimited') {
      dailyRate = Math.round(vehicleData.pricePerDay * 1.3);
    }

    // Check for DB-specific overrides if they exist (future proofing)
    if (vehicleData.rentalOptions?.daily?.[rentalTier]?.price) {
      dailyRate = vehicleData.rentalOptions.daily[rentalTier].price;
    }

    // Calculate total price in INR
    let totalPrice = totalDays * dailyRate;

    // Add driver fee
    let totalDriverFee = 0;
    if (withDriver) {
      totalDriverFee = 500 * totalDays;
      totalPrice += totalDriverFee;
    }

    // Apply Surge Pricing
    if (surgeMultiplier > 1.0) {
      totalPrice = Math.round(totalPrice * surgeMultiplier);
    }

    // Generate unique Booking ID
    const generateBookingId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'BK-';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let bookingId = generateBookingId();
    // Ensure uniqueness (simple check)
    let isUnique = false;
    while (!isUnique) {
      const existing = await Booking.findOne({ bookingId });
      if (!existing) {
        isUnique = true;
      } else {
        bookingId = generateBookingId();
      }
    }

    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      vehicle,
      pickupDate,
      dropoffDate,
      pickupLocation,
      dropoffLocation,
      totalDays,
      totalPrice // Price now includes surge
    });

    await booking.populate({
      path: 'vehicle',
      populate: { path: 'ownerId', select: 'username email' }
    });
    await booking.populate('user', 'username email');

    // Send email notification (Booking Received - Pending Payment)
    await sendBookingConfirmation(booking);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings/user/:id
// @desc    Get all bookings for a user
// @access  Private
router.get('/user/:id', protect, async (req, res) => {
  try {
    // Check if user is accessing their own bookings or is admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bookings = await Booking.find({ user: req.params.id })
      .populate('vehicle')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicle')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bookings/partner-bookings
// @desc    Get bookings for partner's vehicles
// @access  Private (Partner)
router.get('/partner-bookings', authenticatePartner, async (req, res) => {
  try {
    // 1. Find all vehicles owned by the partner
    const vehicles = await Vehicle.find({ ownerId: req.user._id }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);

    // 2. Find bookings for these vehicles
    const bookings = await Booking.find({ vehicle: { $in: vehicleIds } })
      .populate('vehicle')
      .populate('user', 'username email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'username email')
      .populate({
        path: 'vehicle',
        populate: { path: 'ownerId', select: 'username email' }
      });

    // Send email if status is confirmed
    if (booking && req.body.status === 'confirmed') {
      await sendBookingConfirmation(booking);
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

