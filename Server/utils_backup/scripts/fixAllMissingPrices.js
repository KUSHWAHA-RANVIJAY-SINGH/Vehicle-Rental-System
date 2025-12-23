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

const fixPrices = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('MongoDB Connected...');

                  const vehicles = await Vehicle.find({});
                  let updatedCount = 0;

                  for (const v of vehicles) {
                           // Check if updates are needed
                           if (!v.rentalOptions || !v.rentalOptions.daily || !v.rentalOptions.daily.limit120 || !v.rentalOptions.daily.limit120.price) {

                                    const basePrice = v.pricePerDay;

                                    // Calculate new options
                                    const rentalOptions = {
                                             daily: {
                                                      limit120: { price: Math.round(basePrice * 0.85) },
                                                      limit300: { price: basePrice },
                                                      unlimited: { price: Math.round(basePrice * 1.3) }
                                             },
                                             weekly: {
                                                      price: basePrice * 6
                                             },
                                             monthly: {
                                                      price: basePrice * 22
                                             }
                                    };

                                    v.rentalOptions = rentalOptions;
                                    await v.save();
                                    console.log(`Updated ${v.name}: Base ${basePrice} -> 120km: ${rentalOptions.daily.limit120.price}`);
                                    updatedCount++;
                           }
                  }

                  console.log(`Finished. Updated ${updatedCount} vehicles.`);
                  process.exit();
         } catch (err) {
                  console.error(err);
                  process.exit(1);
         }
};

fixPrices();
