import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental';

const run = async () => {
         try {
                  await mongoose.connect(MONGODB_URI);
                  console.log('Connected');

                  // Create a test vehicle
                  const vehicle = await Vehicle.create({
                           name: 'Test Car', type: 'car', brand: 'Test', model: 'T1', year: 2025, pricePerDay: 100, location: 'Testville'
                  });

                  const userId = new mongoose.Types.ObjectId();

                  // First booking
                  const b1 = await Booking.create({
                           user: userId,
                           vehicle: vehicle._id,
                           pickupDate: new Date('2026-01-10'),
                           dropoffDate: new Date('2026-01-12'),
                           pickupLocation: 'A',
                           dropoffLocation: 'B',
                           totalDays: 2,
                           totalPrice: 200,
                           status: 'confirmed'
                  });

                  console.log('Created booking 1:', b1._id.toString());

                  // Attempt conflicting booking
                  const pickup = new Date('2026-01-11');
                  const dropoff = new Date('2026-01-13');

                  const conflict = await Booking.findOne({
                           vehicle: vehicle._id,
                           status: { $in: ['pending', 'confirmed'] },
                           $and: [{ pickupDate: { $lt: dropoff } }, { dropoffDate: { $gt: pickup } }]
                  });

                  console.log('Conflict found:', !!conflict, conflict?._id?.toString());

                  // Cleanup
                  await Booking.deleteMany({ vehicle: vehicle._id });
                  await Vehicle.findByIdAndDelete(vehicle._id);

                  console.log('Done');
                  process.exit(0);
         } catch (err) {
                  console.error(err);
                  process.exit(1);
         }
};

run();