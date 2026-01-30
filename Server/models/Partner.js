import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const partnerSchema = new mongoose.Schema({
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
                  default: 'partner'
         },
         isVerified: {
                  type: Boolean,
                  default: false
         },
         partnerDetails: {
                  bankName: { type: String },
                  bankAccount: { type: String },
                  ifsc: { type: String },
                  panCard: { type: String },
         },
         aadharCard: { type: String },
         panCardImage: { type: String },
         phone: {
                  type: String,
                  trim: true
         },
         address: {
                  type: String,
                  trim: true
         }
}, {
         timestamps: true
});

// Hash password before saving
partnerSchema.pre('save', async function (next) {
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
partnerSchema.methods.comparePassword = async function (candidatePassword) {
         return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
partnerSchema.methods.toJSON = function () {
         const partner = this.toObject();
         delete partner.password;
         return partner;
};

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;
