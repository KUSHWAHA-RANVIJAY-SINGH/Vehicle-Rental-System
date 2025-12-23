import 'dotenv/config';
import mongoose from 'mongoose';
import Vehicle from '../../models/Vehicle.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

const checkPrices = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('MongoDB Connected...');

                  const vehicles = await Vehicle.find({});
                  console.log(`Found ${vehicles.length} vehicles.`);

                  const missing = vehicles.filter(v =>
                           !v.rentalOptions ||
                           !v.rentalOptions.daily ||
                           !v.rentalOptions.daily.limit120 ||
                           !v.rentalOptions.daily.limit120.price
                  );

                  console.log(`Found ${missing.length} vehicles with missing/incomplete rentalOptions.`);

                  missing.forEach(v => {
                           console.log(`- ${v.name} (ID: ${v._id}): Base Price ${v.pricePerDay}`);
                  });

                  process.exit();
         } catch (err) {
                  console.error(err);
                  process.exit(1);
         }
};

checkPrices();
