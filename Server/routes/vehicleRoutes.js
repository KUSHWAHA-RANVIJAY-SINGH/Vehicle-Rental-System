import express from 'express';
import { body, validationResult } from 'express-validator';
import Vehicle from '../models/Vehicle.js';
import { protect, admin, protectPartner } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { calculateSurge } from '../utils/pricing.js';

const router = express.Router();

// @route   GET /api/vehicles/my-vehicles
// @desc    Get logged in partner's vehicles
// @access  Private (Partner/Admin)
router.get('/my-vehicles', protect, protectPartner, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

      // Calculate surge for each vehicle
      const results = await Promise.all(vehicles.map(async (vehicle) => {
        const surge = await calculateSurge(vehicle, pickup, dropoff);
        const surgeMultiplier = surge.multiplier;

        // Return vehicle with updated price (or separate surge info). 
        // For standard display purposes, let's update the price per day temporarily in the response 
        // OR add a 'currentPrice' field. To not break frontend, let's add `surgeMultiplier` and `currentPrice`.
        return {
          ...vehicle, // vehicle is a plain object from aggregate
          surgeMultiplier,
          currentPrice: Math.round(vehicle.pricePerDay * surgeMultiplier)
        };
      }));

      return res.json(results);
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

    let vehicleId = req.params.id;

    // Resolve slug or ID to full vehicle object
    let vehicle;
    if (vehicleId.match(/^[0-9a-fA-F]{24}$/)) {
      vehicle = await Vehicle.findById(vehicleId);
    } else {
      vehicle = await Vehicle.findOne({ slug: vehicleId });
    }

    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    vehicleId = vehicle._id;

    const conflict = await (await import('../models/Booking.js')).default.findOne({
      vehicle: vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $and: [
        { pickupDate: { $lt: dropoff } },
        { dropoffDate: { $gt: pickup } }
      ]
    });

    // Calculate Surge
    const surgeData = await calculateSurge(vehicle, pickup, dropoff);

    res.json({
      available: !Boolean(conflict),
      conflict: conflict ? { id: conflict._id, pickupDate: conflict.pickupDate, dropoffDate: conflict.dropoffDate } : null,
      surge: surgeData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle by ID or Slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let vehicle;

    // Check if it's a valid ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      vehicle = await Vehicle.findById(id);
    }

    // If not found by ID or not a valid ID, try finding by slug
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ slug: id });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/vehicles
// @desc    Create a new vehicle (Partner/Admin)
// @access  Private
router.post('/', protect, protectPartner, upload.array('images', 5), [
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

    let imagePaths = [];

    // 1. Add uploaded files
    if (req.files) {
      imagePaths = req.files.map(file => file.path);
    }

    // 2. Add provided URLs (from req.body.images)
    // frontend might send "images" as a comma-separated string or array
    if (req.body.images) {
      let urls = [];
      if (Array.isArray(req.body.images)) {
        urls = req.body.images;
      } else if (typeof req.body.images === 'string') {
        urls = req.body.images.split(',').map(u => u.trim()).filter(Boolean);
      }
      imagePaths = [...imagePaths, ...urls];
    }

    const vehicleData = {
      ...req.body,
      ownerId: req.user._id,
      status: 'Pending', // Default to pending
      images: imagePaths
    };

    const vehicle = await Vehicle.create(vehicleData);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle (Partner/Admin)
// @access  Private
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check ownership (if not admin)
    if (req.user.role !== 'admin' && vehicle.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vehicle' });
    }

    // Handle Image Updates
    let imagePaths = [];

    // 1. Add uploaded files
    if (req.files) {
      if (Array.isArray(req.files)) {
        imagePaths = req.files.map(file => file.path);
      }
    }

    // 2. Add provided URLs/Existing Images (from req.body.images)
    if (req.body.images) {
      let urls = [];
      if (Array.isArray(req.body.images)) {
        urls = req.body.images;
      } else if (typeof req.body.images === 'string') {
        // If single string or comma-separated
        urls = req.body.images.split(',').map(u => u.trim()).filter(Boolean);
      }
      imagePaths = [...imagePaths, ...urls];
    }

    // If no images provided at all in update, preserve existing? 
    // Usually invalid if we want to allow deleting all images, but let's assume if 'images' field is missing from body (JSON), 
    // we might want to keep old ones. 
    // BUT since we are sending FormData, 'images' key might be present but empty if all deleted.
    // Logic: If 'images' key exists in body or files, use that. If completely absent, keep old?
    // Frontend keeps `existingImages` and sends them back. So `imagePaths` should be the final state.

    const updateData = { ...req.body };

    // Only update images if we have processed some (or if explicit empty list sent)
    // If the frontend sends the list, we use it.
    if (imagePaths.length > 0 || req.body.images) {
      updateData.images = imagePaths;
    }

    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

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

