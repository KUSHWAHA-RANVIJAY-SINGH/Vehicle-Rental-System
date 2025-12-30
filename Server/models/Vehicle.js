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
  },
  slug: {
    type: String,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for search
vehicleSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });

// Create slug from name
vehicleSchema.pre('save', function (next) {
  if (!this.isModified('name') && this.slug) {
    return next();
  }

  // Basic slug from name
  let slugBase = this.name;
  // If name is short/generic, maybe append model or year, but let's stick to name + random string if duplicate logic is needed
  // ideally slugify handles it but mongoose needs unique value. 
  // For simplicity, let's just slugify the name. Uniqueness handled by MongoDB error if conflict, 
  // but usually we might want to append a nanoid or counter. 
  // Let's rely on a robust slugify config and maybe append year if name is generic.

  // Better approach: slugify name + model + year for better SEO and uniqueness chance
  const slugString = `${this.brand} ${this.name} ${this.year}`;

  this.slug = slugString
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;

