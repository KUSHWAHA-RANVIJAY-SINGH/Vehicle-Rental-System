import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const checkUserDocs = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental');
                  console.log('MongoDB connected');

                  const email = 'kuranvijay4@gmail.com';
                  const user = await User.findOne({ email });

                  if (user) {
                           console.log('User found:', user.username);
                           console.log('Driving License Path:', user.drivingLicense);
                           console.log('Aadhar Card Path:', user.aadharCard);
                  } else {
                           console.log('User not found');
                  }

                  mongoose.disconnect();
         } catch (error) {
                  console.error('Error:', error);
                  process.exit(1);
         }
};

checkUserDocs();
