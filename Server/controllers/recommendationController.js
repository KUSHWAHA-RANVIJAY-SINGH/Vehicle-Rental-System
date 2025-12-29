import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';

// Simple content-based recommender using user's recent bookings
export const getRecommendationsForUser = async (req, res) => {
         try {
                  const userId = req.params.id;
                  const limit = Number(req.query.limit) || 3;

                  // 1. Get recent bookings (most recent 50)
                  const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 }).limit(50).populate('vehicle');

                  if (!bookings || bookings.length === 0) {
                           // Fall back: return latest active vehicles
                           const fallback = await Vehicle.find({ available: true }).sort({ createdAt: -1 }).limit(limit);
                           return res.json({ recommendations: fallback, reason: 'fallback' });
                  }

                  // 2. Aggregate user preferences
                  const typeCounts = {};
                  const brandCounts = {};
                  const priceValues = [];
                  const featureCounts = {};

                  bookings.forEach(b => {
                           if (!b.vehicle) return;
                           const v = b.vehicle;
                           typeCounts[v.type] = (typeCounts[v.type] || 0) + 1;
                           brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1;
                           if (v.pricePerDay) priceValues.push(v.pricePerDay);
                           (v.features || []).forEach(f => { featureCounts[f] = (featureCounts[f] || 0) + 1; });
                  });

                  // compute central price (median)
                  priceValues.sort((a, b) => a - b);
                  const medianPrice = priceValues.length ? priceValues[Math.floor(priceValues.length / 2)] : null;

                  const preferredType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
                  const preferredBrand = Object.keys(brandCounts).sort((a, b) => brandCounts[b] - brandCounts[a])[0];

                  // 3. Score candidate vehicles
                  // Limit candidate set to available vehicles and some basic filters
                  const candidates = await Vehicle.find({ available: true }).lean();

                  const scored = candidates.map(v => {
                           let score = 0;
                           if (preferredType && v.type === preferredType) score += 5;
                           if (preferredBrand && v.brand === preferredBrand) score += 4;
                           if (medianPrice && v.pricePerDay) {
                                    const diff = Math.abs(v.pricePerDay - medianPrice);
                                    // closer prices get higher score
                                    score += Math.max(0, 3 - Math.round(diff / (medianPrice || 1) * 3));
                           }
                           (v.features || []).forEach(f => {
                                    if (featureCounts[f]) score += Math.min(3, featureCounts[f]);
                           });

                           // Slight prefer vehicles with more images / description
                           if (v.images && v.images.length) score += Math.min(2, v.images.length);
                           if (v.description) score += 1;

                           return { vehicle: v, score };
                  });

                  // Remove vehicles the user already booked recently
                  const bookedVehicleIds = new Set(bookings.map(b => String(b.vehicle?._id)).filter(Boolean));
                  const filtered = scored.filter(s => !bookedVehicleIds.has(String(s.vehicle._id)));

                  filtered.sort((a, b) => b.score - a.score);

                  const recommendations = filtered.slice(0, limit).map(s => s.vehicle);

                  res.json({ recommendations, reason: 'personalized', meta: { preferredType, preferredBrand, medianPrice } });
         } catch (error) {
                  console.error('Recommendation error', error);
                  res.status(500).json({ message: 'Failed to generate recommendations', error: error.message });
         }
};