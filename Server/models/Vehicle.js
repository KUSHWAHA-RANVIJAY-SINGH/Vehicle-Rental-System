import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['car', 'bike'],
    lowercase: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  rentalOptions: {
    daily: {
      limit120: { price: Number },
      limit300: { price: Number },
      unlimited: { price: Number }
    },
    weekly: {
      price: Number
    },
    monthly: {
      price: Number
    }
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'petrol'
  },
  seats: {
    type: Number,
    min: 1,
    max: 50
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  color: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true,
    index: true
  },
  vin: {
    type: String,
    trim: true,
    index: true
  },
  odometerKm: {
    type: Number,
    min: 0
  },
  fuelEconomy: {
    type: Number, // km per liter
    min: 0
  },
  insuranceExpiry: {
    type: Date
  },
  documents: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  available: {
    type: Boolean,
    default: true
  },
  features: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Index for search
vehicleSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;

