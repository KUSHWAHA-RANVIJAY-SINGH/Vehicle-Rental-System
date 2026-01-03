import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Config setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assuming running from Server root
dotenv.config();

console.log('CWD:', process.cwd());
// console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

const generateBookingId = () => {
         const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
         let result = 'BK-';
         for (let i = 0; i < 6; i++) {
                  result += chars.charAt(Math.floor(Math.random() * chars.length));
         }
         return result;
};

const migrateBookings = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('Connected to MongoDB');

                  const bookings = await Booking.find({ bookingId: { $exists: false } });
                  console.log(`Found ${bookings.length} bookings without IDs.`);

                  for (const booking of bookings) {
                           let bookingId = generateBookingId();
                           let isUnique = false;

                           // Ensure uniqueness
                           while (!isUnique) {
                                    const existing = await Booking.findOne({ bookingId });
                                    if (!existing) {
                                             isUnique = true;
                                    } else {
                                             bookingId = generateBookingId();
                                    }
                           }

                           booking.bookingId = bookingId;
                           await booking.save();
                           console.log(`Updated booking ${booking._id} with ID ${bookingId}`);
                  }

                  console.log('Migration completed successfully.');
                  process.exit(0);
         } catch (error) {
                  console.error('Migration failed:', error);
                  process.exit(1);
         }
};

migrateBookings();
