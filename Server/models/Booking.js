import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  dropoffDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(dropoffDate) {
        return dropoffDate > this.pickupDate;
      },
      message: 'Drop-off date must be after pickup date'
    }
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true
  },
  dropoffLocation: {
    type: String,
    required: true,
    trim: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: null
  },
  stripeSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Calculate total days before saving
bookingSchema.pre('save', function(next) {
  if (this.pickupDate && this.dropoffDate) {
    const diffTime = Math.abs(this.dropoffDate - this.pickupDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

