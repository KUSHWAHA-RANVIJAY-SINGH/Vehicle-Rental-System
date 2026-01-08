import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import { calculateSurge, getVehicleAvailability } from '../utils/pricing.js';

describe('Pricing Logic', () => {
         let vehicle1, vehicle2, vehicle3;

         beforeEach(async () => {
                  // Create 3 identical vehicles
                  const vehicleData = {
                           name: 'Civic',
                           type: 'car',
                           brand: 'Honda',
                           model: 'Civic 2023',
                           year: 2023,
                           pricePerDay: 1000,
                           location: 'Bangalore',
                           ownerId: new mongoose.Types.ObjectId(),
                           status: 'Approved',
                           available: true
                  };

                  vehicle1 = await Vehicle.create({ ...vehicleData, registrationNumber: 'KA01AB1111' });
                  vehicle2 = await Vehicle.create({ ...vehicleData, registrationNumber: 'KA01AB2222' });
                  vehicle3 = await Vehicle.create({ ...vehicleData, registrationNumber: 'KA01AB3333' });
         });

         test('should return 1.0 multiplier for weekday with high availability', async () => {
                  // Wednesday (ensure it's not a weekend)
                  const pickup = new Date('2023-11-15T10:00:00Z'); // Wed
                  const dropoff = new Date('2023-11-16T10:00:00Z'); // Thu

                  const result = await calculateSurge(vehicle1, pickup, dropoff);
                  expect(result.multiplier).toBe(1.0);
                  expect(result.reasons).toHaveLength(0);
         });

         test('should apply 10% surge for weekend start date', async () => {
                  // Saturday
                  const pickup = new Date('2023-11-18T10:00:00Z');
                  const dropoff = new Date('2023-11-19T10:00:00Z');

                  const result = await calculateSurge(vehicle1, pickup, dropoff);
                  // Availability is 3 (high), so only weekend surge
                  expect(result.multiplier).toBe(1.10);
                  expect(result.reasons).toContain('Weekend Surge');
         });

         test('should apply 15% surge for low stock (< 2 available)', async () => {
                  // Weekday
                  const pickup = new Date('2023-11-22T10:00:00Z'); // Wed
                  const dropoff = new Date('2023-11-23T10:00:00Z'); // Thu

                  // Book 2 vehicles to leave only 1 available
                  await Booking.create({
                           bookingId: 'BK-1', user: new mongoose.Types.ObjectId(), vehicle: vehicle2._id,
                           pickupDate: pickup, dropoffDate: dropoff, totalDays: 1, totalPrice: 1000,
                           pickupLocation: 'Test Loc', dropoffLocation: 'Test Loc'
                  });
                  await Booking.create({
                           bookingId: 'BK-2', user: new mongoose.Types.ObjectId(), vehicle: vehicle3._id,
                           pickupDate: pickup, dropoffDate: dropoff, totalDays: 1, totalPrice: 1000,
                           pickupLocation: 'Test Loc', dropoffLocation: 'Test Loc'
                  });

                  // Now vehicle1 is the only one left. Availability = 1.
                  // 1 < 2, so surge applies.

                  const availability = await getVehicleAvailability(vehicle1.brand, vehicle1.model, pickup, dropoff);
                  expect(availability).toBe(1);

                  const result = await calculateSurge(vehicle1, pickup, dropoff);
                  expect(result.multiplier).toBe(1.15);
                  expect(result.reasons).toContain('High Demand (Low Stock)');
         });

         test('should apply combined surge (25%) for weekend + low stock', async () => {
                  // Saturday
                  const pickup = new Date('2023-11-25T10:00:00Z');
                  const dropoff = new Date('2023-11-26T10:00:00Z');

                  // Book 2 vehicles
                  await Booking.create({
                           bookingId: 'BK-3', user: new mongoose.Types.ObjectId(), vehicle: vehicle2._id,
                           pickupDate: pickup, dropoffDate: dropoff, totalDays: 1, totalPrice: 1000,
                           pickupLocation: 'Test Loc', dropoffLocation: 'Test Loc'
                  });
                  await Booking.create({
                           bookingId: 'BK-4', user: new mongoose.Types.ObjectId(), vehicle: vehicle3._id,
                           pickupDate: pickup, dropoffDate: dropoff, totalDays: 1, totalPrice: 1000,
                           pickupLocation: 'Test Loc', dropoffLocation: 'Test Loc'
                  });

                  const result = await calculateSurge(vehicle1, pickup, dropoff);
                  expect(result.multiplier).toBe(1.25);
                  expect(result.reasons).toEqual(expect.arrayContaining(['Weekend Surge', 'High Demand (Low Stock)']));
         });
});
