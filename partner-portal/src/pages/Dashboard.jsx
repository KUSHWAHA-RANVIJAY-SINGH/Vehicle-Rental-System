import React, { useEffect, useState } from 'react';
import { FaWallet, FaCarSide, FaRoute } from 'react-icons/fa';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <div className={`p-4 rounded-full ${color} text-white`}>
                           <span className="text-2xl">{icon}</span>
                  </div>
                  <div>
                           <p className="text-gray-500 text-sm font-medium">{title}</p>
                           <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                  </div>
         </div>
);

const Dashboard = () => {
         const [stats, setStats] = useState({
                  earnings: 0,
                  vehicles: 0,
                  trips: 0
         });
         const [recentBookings, setRecentBookings] = useState([]);
         const [loading, setLoading] = useState(true);

         useEffect(() => {
                  const fetchData = async () => {
                           try {
                                    const [vehiclesRes, bookingsRes] = await Promise.all([
                                             api.get('/vehicles/my-vehicles'),
                                             api.get('/bookings/partner-bookings')
                                    ]);

                                    const vehicles = vehiclesRes.data;
                                    const bookings = bookingsRes.data;

                                    // Calculate Stats
                                    // Earnings: Sum of totalPrice for bookings that are paid
                                    // Note: Schema might have 'paymentStatus'. If not, assume 'completed' bookings are paid.
                                    // Admin.jsx checks paymentStatus === 'paid'.
                                    // If paymentStatus is not populated or available, we might fall back to status 'completed'. 
                                    // Let's check a sample booking if we could, but safely:
                                    // Platform takes 10% commission, so partner earns 90%
                                    const totalEarnings = bookings
                                             .filter(b => b.paymentStatus === 'paid' || b.status === 'completed')
                                             .reduce((sum, b) => sum + ((b.totalPrice || 0) * 0.9), 0);

                                    const totalTrips = bookings.filter(b => b.status === 'completed').length;

                                    setStats({
                                             earnings: totalEarnings,
                                             vehicles: vehicles.length,
                                             trips: totalTrips
                                    });

                                    setRecentBookings(bookings.slice(0, 5)); // Top 5 recent
                           } catch (error) {
                                    console.error("Error fetching dashboard data", error);
                           } finally {
                                    setLoading(false);
                           }
                  };

                  fetchData();
         }, []);

         if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

         const statCards = [
                  { title: 'Total Earnings', value: `₹ ${stats.earnings.toLocaleString()}`, icon: <FaWallet />, color: 'bg-green-500' },
                  { title: 'Fleet Size', value: stats.vehicles, icon: <FaCarSide />, color: 'bg-blue-500' },
                  { title: 'Total Trips', value: stats.trips, icon: <FaRoute />, color: 'bg-purple-500' },
         ];

         return (
                  <div className="space-y-8">
                           <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                                    <p className="text-gray-500">Here's what's happening with your fleet today.</p>
                           </div>

                           {/* Stats Grid */}
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {statCards.map((stat, index) => (
                                             <StatCard key={index} {...stat} />
                                    ))}
                           </div>

                           {/* Recent Activity */}
                           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                             <h3 className="text-lg font-bold text-gray-800">Recent Booking Activity</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                             <table className="w-full text-left">
                                                      <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                                               <tr>
                                                                        <th className="px-6 py-4 font-semibold">Vehicle</th>
                                                                        <th className="px-6 py-4 font-semibold">Customer</th>
                                                                        <th className="px-6 py-4 font-semibold">Date</th>
                                                                        <th className="px-6 py-4 font-semibold">Status</th>
                                                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                                               </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-100">
                                                               {recentBookings.length > 0 ? recentBookings.map((item) => (
                                                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                                                 <td className="px-6 py-4 font-medium text-gray-800">
                                                                                          {item.vehicle?.name || 'Unknown Vehicle'}
                                                                                          <div className="text-xs text-gray-500">{item.vehicle?.brand}</div>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-gray-600">
                                                                                          {item.user?.username || 'Unknown User'}
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-gray-600">
                                                                                          {new Date(item.pickupDate).toLocaleDateString()}
                                                                                 </td>
                                                                                 <td className="px-6 py-4">
                                                                                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                                                   item.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                                                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                                                                     'bg-red-100 text-red-700'
                                                                                                   }`}>
                                                                                                   {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                                                          </span>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-right font-medium text-gray-800">
                                                                                          <div className="flex flex-col items-end">
                                                                                                   <span>₹ {(item.totalPrice * 0.9).toLocaleString()}</span>
                                                                                                   <span className="text-[10px] text-gray-400">Net Earned</span>
                                                                                          </div>
                                                                                 </td>
                                                                        </tr>
                                                               )) : (
                                                                        <tr>
                                                                                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                                                          No recent bookings found.
                                                                                 </td>
                                                                        </tr>
                                                               )}
                                                      </tbody>
                                             </table>
                                    </div>
                           </div>
                  </div>
         );
};

export default Dashboard;
