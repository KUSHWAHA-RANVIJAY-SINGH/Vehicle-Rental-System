import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function () { return !this.googleId; },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'partner'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  partnerDetails: {
    bankAccount: { type: String },
    ifsc: { type: String },
    panCard: { type: String }, // URL or Number? Assuming Number/String for now based on context, or could be image URL. Let's assume String data.
    // If user meant images, they usually say "Image". "panCard" inside partnerDetails along with bank stuff suggests data.
    // But typically KYC involves images. Let's keep it generic String.
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  drivingLicense: {
    type: String
  },
  aadharCard: {
    type: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;

