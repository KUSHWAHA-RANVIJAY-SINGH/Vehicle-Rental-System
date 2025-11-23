import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdminPassword = async () => {
         try {
                  // Connect to MongoDB
                  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental');
                  console.log('Connected to MongoDB');

                  const email = 'admin@rentwheels.com';
                  const newPassword = 'admin123';

                  // Find admin user
                  const admin = await User.findOne({ email });

                  if (!admin) {
                           console.log('Admin user not found! Please run createAdmin.js first.');
                           process.exit(1);
                  }

                  console.log(`Found admin user: ${admin.username}`);

                  // Update password
                  // Note: We assign the plain text password. The pre-save hook in User model will hash it.
                  admin.password = newPassword;
                  await admin.save();

                  console.log('✅ Admin password successfully reset to: admin123');

                  process.exit(0);
         } catch (error) {
                  console.error('Error resetting password:', error);
                  process.exit(1);
         }
};

resetAdminPassword();
