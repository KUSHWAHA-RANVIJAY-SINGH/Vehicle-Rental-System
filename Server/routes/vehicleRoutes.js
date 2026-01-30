import express from 'express';
import { body, validationResult } from 'express-validator';
import Vehicle from '../models/Vehicle.js';
import { protect, admin, protectPartner, authenticatePartner } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { calculateSurge } from '../utils/pricing.js';

const router = express.Router();

const getPriceFromCC = (cc, type = 'car') => {
  const ccNum = Number(cc);
  if (!ccNum || ccNum <= 0) return 0;

  const vehicleType = type ? type.toLowerCase() : 'car';

  if (vehicleType === 'bike') {
    // Bike: Base ₹400 (first 100cc) + ₹40 per extra 25cc
    const basePrice = 400;
    const baseCC = 100;
    const ratePerExtra25CC = 40;

    if (ccNum <= baseCC) return basePrice;

    const extraCC = ccNum - baseCC;
    const extraSlabs = Math.ceil(extraCC / 25);
    return basePrice + (extraSlabs * ratePerExtra25CC);
  } else {
    // Car: Base ₹2000 (first 800cc) + ₹100 per extra 25cc
    const basePrice = 2000;
    const baseCC = 800;
    const ratePerExtra25CC = 100;

    if (ccNum <= baseCC) return basePrice;

    const extraCC = ccNum - baseCC;
    const extraSlabs = Math.ceil(extraCC / 25);
    return basePrice + (extraSlabs * ratePerExtra25CC);
  }
};

// @route   PUT /api/vehicles/migrate-prices
// @desc    Migrate existing vehicles to have engineCC and dynamic pricing
// @access  Public (Temporary)
router.put('/migrate-prices', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    let updatedCount = 0;
    let errorCount = 0;

    for (const vehicle of vehicles) {
      try {
        let modified = false;

        // 1. Handle Missing CC
        if (!vehicle.engineCC) {
          if (vehicle.type === 'bike') vehicle.engineCC = 150;
          else if (vehicle.type === 'car') vehicle.engineCC = 1500;
          else vehicle.engineCC = 150; // Fallback
          modified = true;
        }

        // 2. Recalculate Price
        const newPrice = getPriceFromCC(vehicle.engineCC);
        if (vehicle.pricePerDay !== newPrice) {
          vehicle.pricePerDay = newPrice;
          modified = true;
        }

        if (modified) {
          if (!vehicle.ownerId) {
            console.log(`Skipping vehicle ${vehicle._id} due to missing ownerId`);
            errorCount++;
            continue;
          }
          await vehicle.save();
          updatedCount++;
        }
      } catch (innerErr) {
        console.error(`Failed to update vehicle ${vehicle._id}:`, innerErr.message);
        errorCount++;
      }
    }

    res.json({ message: `Successfully migrated ${updatedCount} vehicles. Failed: ${errorCount}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
});

// @route   GET /api/vehicles/my-vehicles
// @desc    Get logged in partner's vehicles
// @access  Private (Partner/Admin)
router.get('/my-vehicles', authenticatePartner, async (req, res) => {
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
router.post('/', authenticatePartner, upload.array('images', 5), [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['car', 'bike']).withMessage('Type must be car or bike'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('engineCC').isNumeric().withMessage('Engine CC is required'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let imagePaths = [];

    // 1. Add uploaded files (STORE RELATIVE PATHS)
    if (req.files) {
      imagePaths = req.files.map(file => `uploads/documents/${file.filename}`);
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

    // Determine price: Use provided price, else calculate from CC
    let finalPrice = req.body.pricePerDay;
    if (!finalPrice) {
      finalPrice = getPriceFromCC(req.body.engineCC);
    }

    const vehicleData = {
      ...req.body,
      ownerId: req.user._id,
      status: 'Pending', // Default to pending
      images: imagePaths,
      pricePerDay: finalPrice
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
router.put('/:id', authenticatePartner, upload.array('images', 5), async (req, res) => {
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

    // 1. Add uploaded files (STORE RELATIVE PATHS)
    if (req.files) {
      if (Array.isArray(req.files)) {
        imagePaths = req.files.map(file => `uploads/documents/${file.filename}`);
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

    const updateData = { ...req.body };

    // Explicitly handle pricePerDay to ensure it is treated as a number if present
    if (req.body.pricePerDay) {
      updateData.pricePerDay = Number(req.body.pricePerDay);
    }

    // Do NOT automatically overwrite price based on CC during update unless price is missing and CC changed?
    // Actually, trusting the user input is better. If they send pricePerDay, use it.
    // If they don't send pricePerDay but change CC, maybe we should warn? But for now, let's strictly use what's sent.

    // Only update images if we have processed some (or if explicit empty list sent logic - complicated)
    // If we have new files OR explicit images list, update images.
    if (imagePaths.length > 0 || (req.files && req.files.length > 0)) {
      updateData.images = imagePaths;
    }
    // If req.body.images was passed (even empty), we might want to respect it if we want to delete all.
    // But currently frontend sends existing images back.

    vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(vehicle);
  } catch (error) {
    // Debug logging
    console.error('PUT Update Error:', error);
    import('fs').then(fs => {
      fs.appendFileSync('debug_error.log', `[${new Date().toISOString()}] ${error.stack}\n`);
    });
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

