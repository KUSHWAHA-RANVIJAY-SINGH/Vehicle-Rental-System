import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../utils/axios';
import VehicleCard from './VehicleCard';
import { FaRobot } from 'react-icons/fa';

const RecommendedVehicles = () => {
         const { user, isAuthenticated } = useSelector((state) => state.auth);
         const [recommendations, setRecommendations] = useState([]);
         const [loading, setLoading] = useState(true);
         const [reason, setReason] = useState('');
         const [error, setError] = useState(null);

         useEffect(() => {
                  const fetchRecommendations = async () => {
                           // Only fetch if logged in
                           if (!isAuthenticated || !user) {
                                    setLoading(false);
                                    return;
                           }

                           try {
                                    const response = await axios.get(`/recommendations/user/${user._id}?limit=3`);
                                    setRecommendations(response.data.recommendations);
                                    setReason(response.data.reason);
                           } catch (err) {
                                    console.error('Failed to fetch recommendations:', err);
                                    setError('Could not load recommendations');
                           } finally {
                                    setLoading(false);
                           }
                  };

                  fetchRecommendations();
         }, [isAuthenticated, user]);

         if (!isAuthenticated || loading || recommendations.length === 0) {
                  return null;
         }

         return (
                  <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50/50">
                           <div className="container mx-auto px-4">
                                    <div className="flex items-center space-x-3 mb-8">
                                             <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                                                      <FaRobot className="text-white text-xl animate-pulse" />
                                             </div>
                                             <div>
                                                      <h2 className="text-3xl font-bold text-gray-900">Recommended For You</h2>
                                                      <p className="text-gray-500 text-sm mt-1">
                                                               {reason === 'ai-content-based'
                                                                        ? `Based on your recent interest in similar vehicles`
                                                                        : reason === 'heuristic-backup'
                                                                                 ? `Based on your viewing history`
                                                                                 : `Popular in your area`}
                                                      </p>
                                             </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                             {recommendations.map((vehicle) => (
                                                      <VehicleCard key={vehicle._id} vehicle={vehicle} />
                                             ))}
                                    </div>
                           </div>
                  </section>
         );
};

export default RecommendedVehicles;
