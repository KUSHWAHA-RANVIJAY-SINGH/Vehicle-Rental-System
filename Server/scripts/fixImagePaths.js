import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const migrate = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental');
                  console.log('Connected to MongoDB');

                  const vehicles = await Vehicle.find({});
                  console.log(`Found ${vehicles.length} vehicles.`);

                  let updatedCount = 0;

                  for (const vehicle of vehicles) {
                           let changed = false;
                           const newImages = vehicle.images.map(img => {
                                    if (img && img.includes('src/assets/')) {
                                             changed = true;
                                             // Replace 'src/assets/' with 'uploads/'
                                             // If the path was 'src/assets/car.png', it becomes 'uploads/car.png'
                                             return img.replace('src/assets/', 'uploads/');
                                    }
                                    return img;
                           });

                           if (changed) {
                                    vehicle.images = newImages;
                                    await vehicle.save();
                                    updatedCount++;
                                    console.log(`Updated vehicle: ${vehicle.make} ${vehicle.model} (${vehicle._id})`);
                           }
                  }

                  console.log(`Migration complete. Updated ${updatedCount} vehicles.`);
                  process.exit(0);
         } catch (error) {
                  console.error('Migration failed:', error);
                  process.exit(1);
         }
};

migrate();
