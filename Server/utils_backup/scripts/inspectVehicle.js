import 'dotenv/config';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

const inspect = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('MongoDB Connected...');

                  // Find a vehicle that was showing as broken in the screenshot, e.g., "Tata Harrier"
                  const vehicle = await Vehicle.findOne({ name: 'Tata Harrier' });

                  if (vehicle) {
                           console.log('Vehicle Name:', vehicle.name);
                           console.log('Base Price:', vehicle.pricePerDay);
                           console.log('Rental Options:', JSON.stringify(vehicle.rentalOptions, null, 2));
                  } else {
                           console.log('Tata Harrier not found.');
                  }

                  process.exit();
         } catch (err) {
                  console.error(err);
                  process.exit(1);
         }
};

inspect();
