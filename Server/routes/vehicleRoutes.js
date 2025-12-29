import express from 'express';
import { body, validationResult } from 'express-validator';
import Vehicle from '../models/Vehicle.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles with optional filters
// @access  Public
router.get('/', async (req, res) => {// If caller passes start & end as query params, return only vehicles available for that date range
  if (req.query.start && req.query.end) {
    try {
      const pickup = new Date(req.query.start);
      const dropoff = new Date(req.query.end);
      if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) return res.status(400).json({ message: 'Invalid date format' });
      if (dropoff <= pickup) return res.status(400).json({ message: 'End date must be after start date' });

      const filters = {};
      if (req.query.type) filters.type = req.query.type.toLowerCase();
      if (req.query.brand) filters.brand = new RegExp(req.query.brand, 'i');
      if (req.query.minPrice || req.query.maxPrice) {
        filters.pricePerDay = {};
        if (req.query.minPrice) filters.pricePerDay.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filters.pricePerDay.$lte = Number(req.query.maxPrice);
      }

      // Aggregation: lookup bookings that overlap the requested period; exclude vehicles with any conflicts
      const vehicles = await Vehicle.aggregate([
        { $match: filters },
        {
          $lookup: {
            from: 'bookings',
            let: { vid: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$vehicle', '$$vid'] }, { $in: ['$status', ['pending', 'confirmed']] }, { $lt: ['$pickupDate', dropoff] }, { $gt: ['$dropoffDate', pickup] }] } } }
            ],
            as: 'conflicts'
          }
        },
        { $match: { conflicts: { $size: 0 } } },
        { $sort: { createdAt: -1 } }
      ]);

      return res.json(vehicles);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  try {
    const { type, brand, minPrice, maxPrice, search, available } = req.query;

    let query = {};

    if (type) query.type = type.toLowerCase();
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    if (available !== undefined) query.available = available === 'true';

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/vehicles/:id/availability
// @desc    Check availability for a vehicle for a date range
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'start and end query parameters are required (ISO dates)' });

    const pickup = new Date(start);
    const dropoff = new Date(end);
    if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) return res.status(400).json({ message: 'Invalid date format' });
    if (dropoff <= pickup) return res.status(400).json({ message: 'End date must be after start date' });

    const conflict = await (await import('../models/Booking.js')).default.findOne({
      vehicle: req.params.id,
      status: { $in: ['pending', 'confirmed'] },
      $and: [
        { pickupDate: { $lt: dropoff } },
        { dropoffDate: { $gt: pickup } }
      ]
    });

    res.json({ available: !Boolean(conflict), conflict: conflict ? { id: conflict._id, pickupDate: conflict.pickupDate, dropoffDate: conflict.dropoffDate } : null });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/vehicles
// @desc    Create a new vehicle (admin only)
// @access  Private/Admin
router.post('/', protect, admin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['car', 'bike']).withMessage('Type must be car or bike'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('pricePerDay').isNumeric().withMessage('Price must be a number'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle (admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete a vehicle (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

