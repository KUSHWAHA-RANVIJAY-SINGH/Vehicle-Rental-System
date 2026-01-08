import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import axios from 'axios';

// AI-Powered Recommendation using Python Microservice
export const getRecommendationsForUser = async (req, res) => {
         const userId = req.params.id;
         const limit = Number(req.query.limit) || 3;

         try {
                  // 1. Get user's last booked vehicle
                  const lastBooking = await Booking.findOne({ user: userId })
                           .sort({ createdAt: -1 })
                           .populate('vehicle');

                  // If no history, return fallback (latest available)
                  if (!lastBooking || !lastBooking.vehicle) {
                           const fallback = await Vehicle.find({ available: true, status: 'Approved' })
                                    .sort({ createdAt: -1 })
                                    .limit(limit);
                           return res.json({ recommendations: fallback, reason: 'fallback-no-history' });
                  }

                  // 2. Get all active vehicles
                  // We need to pass them to the python script to find similarity
                  const allVehicles = await Vehicle.find({
                           available: true,
                           status: 'Approved'
                  }).lean();
                  // .lean() converts Mongoose docs to plain JS objects, faster and compatible with JSON

                  // Prepare Payload
                  const payload = {
                           all_vehicles: allVehicles,
                           last_booked_vehicle: lastBooking.vehicle
                  };

                  // 3. Call Python Microservice
                  // Assuming python script is running on port 5000
                  try {
                           const pythonServiceUrl = 'http://localhost:5000/recommend';
                           const response = await axios.post(pythonServiceUrl, payload);

                           const recommendedIds = response.data.recommendations; // Expecting list of IDs

                           if (recommendedIds && recommendedIds.length > 0) {
                                    // 4. Fetch full vehicle objects for the returned IDs
                                    // We preserve the order returned by ML (most similar first)
                                    const recommendations = await Vehicle.find({ _id: { $in: recommendedIds } });

                                    // Sort them to match the order of IDs in recommendedIds
                                    const recommendationMap = new Map(recommendations.map(v => [String(v._id), v]));
                                    const orderedRecommendations = recommendedIds
                                             .map(id => recommendationMap.get(id))
                                             .filter(Boolean); // removal of nulls if not found

                                    return res.json({
                                             recommendations: orderedRecommendations,
                                             reason: 'ai-content-based',
                                             lastBooked: lastBooking.vehicle.name
                                    });
                           }
                  } catch (mlError) {
                           console.warn('Python Microservice Error or Unreachable:', mlError.message);
                           // Fall through to JS backup logic
                  }

                  // ==========================================
                  // BACKUP LOGIC (Node.js Heuristic)
                  // ==========================================
                  // 1. Get recent bookings (already have last one, get more)
                  const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 }).limit(10).populate('vehicle');

                  // Preferences
                  const typeCounts = {};
                  bookings.forEach(b => {
                           if (b.vehicle) {
                                    typeCounts[b.vehicle.type] = (typeCounts[b.vehicle.type] || 0) + 1;
                           }
                  });
                  const preferredType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];

                  // Simple Filter: Same Type, different ID
                  const recommendations = await Vehicle.find({
                           available: true,
                           status: 'Approved',
                           type: preferredType,
                           _id: { $ne: lastBooking.vehicle._id }
                  }).limit(limit);

                  // If still empty (e.g. no other cars of that type), just return generic latest
                  if (recommendations.length === 0) {
                           const generic = await Vehicle.find({
                                    available: true, status: 'Approved', _id: { $ne: lastBooking.vehicle._id }
                           }).limit(limit);
                           return res.json({ recommendations: generic, reason: 'fallback-generic' });
                  }

                  res.json({ recommendations, reason: 'heuristic-backup' });

         } catch (error) {
                  console.error('Recommendation error', error);
                  res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
         }
};