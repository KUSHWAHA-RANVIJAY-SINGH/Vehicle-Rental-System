import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental')
         .then(() => console.log('MongoDB connected'))
         .catch((err) => {
                  console.error('MongoDB connection error:', err);
                  process.exit(1);
         });

const generateSlug = (vehicle) => {
         const slugString = `${vehicle.brand} ${vehicle.name} ${vehicle.year}`;
         return slugString
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '');
};

const runMigration = async () => {
         try {
                  const vehicles = await Vehicle.find({});
                  console.log(`Found ${vehicles.length} vehicles to check.`);

                  let validCount = 0;
                  let updateCount = 0;

                  for (const vehicle of vehicles) {
                           if (!vehicle.slug) {
                                    let slug = generateSlug(vehicle);

                                    // Simple duplicate check
                                    let existing = await Vehicle.findOne({ slug, _id: { $ne: vehicle._id } });
                                    let counter = 1;
                                    while (existing) {
                                             slug = `${generateSlug(vehicle)}-${counter}`;
                                             existing = await Vehicle.findOne({ slug, _id: { $ne: vehicle._id } });
                                             counter++;
                                    }

                                    vehicle.slug = slug;
                                    await vehicle.save();
                                    updateCount++;
                                    console.log(`Updated: ${vehicle.name} -> ${slug}`);
                           } else {
                                    validCount++;
                           }
                  }

                  console.log(`Migration completed. Updated ${updateCount} vehicles. ${validCount} were already valid.`);
                  process.exit(0);
         } catch (error) {
                  console.error('Migration failed:', error);
                  process.exit(1);
         }
};

runMigration();
