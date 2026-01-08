import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';

/**
 * Get the number of available vehicles of a specific model for a date range.
 * @param {string} brand - Vehicle brand
 * @param {string} model - Vehicle model
 * @param {Date} pickupDate - Start of rental
 * @param {Date} dropoffDate - End of rental
 * @returns {Promise<number>} - Number of available vehicles
 */
export const getVehicleAvailability = async (brand, model, pickupDate, dropoffDate) => {
         // 1. Count total vehicles of this model
         // We use regex to match case-insensitive or exact match depending on how strict we want to be.
         // Assuming exact match for 'model' and 'brand' as they should be consistent in DB.
         const totalVehicles = await Vehicle.find({
                  brand: brand,
                  model: model,
                  status: 'Approved', // Only count active/approved vehicles logic
                  available: true     // Global availability flag
         }).select('_id');

         if (totalVehicles.length === 0) return 0;

         const vehicleIds = totalVehicles.map(v => v._id);

         // 2. Count bookings that overlap with the requested dates for ANY of these vehicles
         // Overlap condition: Booking Start < Request End AND Booking End > Request Start
         const conflictingBookings = await Booking.countDocuments({
                  vehicle: { $in: vehicleIds },
                  status: { $in: ['pending', 'confirmed'] },
                  $and: [
                           { pickupDate: { $lt: dropoffDate } },
                           { dropoffDate: { $gt: pickupDate } }
                  ]
         });

         // 3. Available = Total - Conflicted
         return totalVehicles.length - conflictingBookings;
};

/**
 * Calculate surge price multiplier.
 * @param {Object} vehicle - The vehicle object from DB
 * @param {Date} pickupDate - Start of rental
 * @param {Date} dropoffDate - End of rental
 * @returns {Promise<Object>} - { multiplier: number, reasons: string[] }
 */
export const calculateSurge = async (vehicle, pickupDate, dropoffDate) => {
         let multiplier = 1.0;
         const reasons = [];

         // 1. Weekend Logic
         // Check if the START date is Saturday (6) or Sunday (0)
         // Requirement: "If booking is on a weekend (Sat/Sun), increase price by 10%"
         const day = pickupDate.getDay();
         if (day === 0 || day === 6) {
                  multiplier += 0.10;
                  reasons.push('Weekend Surge');
         }

         // 2. Low Stock Logic
         // Requirement: "If availability is low (e.g., less than 2 left), increase price by 15%"
         const availableCount = await getVehicleAvailability(vehicle.brand, vehicle.model, pickupDate, dropoffDate);

         // Note: 'availableCount' includes the vehicle we are presumably about to book if we haven't filtered it out.
         // If we are checking BEFORE booking, and availability is 1 (this car), that is "less than 2".
         // If availability is 2, it is not "less than 2".
         // The prompt says "less than 2 left". This usually means 0 or 1.
         if (availableCount < 2) {
                  multiplier += 0.15;
                  reasons.push('High Demand (Low Stock)');
         }

         // Cap or rounding can happen here if needed, but we keep it raw for now.
         // We return a fixed precision number to avoid floating point weirdness (e.g. 1.250000001)
         // but let's just return the float and handle rounding at price calculation.
         return {
                  multiplier: Number(multiplier.toFixed(2)),
                  reasons
         };
};
