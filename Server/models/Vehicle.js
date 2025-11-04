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

