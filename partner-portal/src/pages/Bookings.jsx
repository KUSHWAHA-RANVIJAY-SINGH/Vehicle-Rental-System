import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Bookings = () => {
         const [bookings, setBookings] = useState([]);
         const [loading, setLoading] = useState(true);

         useEffect(() => {
                  const fetchBookings = async () => {
                           try {
                                    const res = await api.get('/bookings/partner-bookings');
                                    setBookings(res.data);
                           } catch (error) {
                                    console.error("Failed to fetch bookings", error);
                           } finally {
                                    setLoading(false);
                           }
                  };
                  fetchBookings();
         }, []);

         if (loading) return <div className="p-8 text-center text-gray-500">Loading Bookings...</div>;

         return (
                  <div className="space-y-6">
                           <div>
                                    <h2 className="text-2xl font-bold text-gray-800">My Bookings</h2>
                                    <p className="text-gray-500">Manage all your vehicle bookings.</p>
                           </div>

                           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                             <table className="w-full text-left">
                                                      <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                                               <tr>
                                                                        <th className="px-6 py-4 font-semibold">Booking ID</th>
                                                                        <th className="px-6 py-4 font-semibold">Vehicle</th>
                                                                        <th className="px-6 py-4 font-semibold">Customer</th>
                                                                        <th className="px-6 py-4 font-semibold">Dates</th>
                                                                        <th className="px-6 py-4 font-semibold">Status</th>
                                                                        <th className="px-6 py-4 font-semibold text-right">Total</th>
                                                               </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-100">
                                                               {bookings.length > 0 ? bookings.map((booking) => (
                                                                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                                                 <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                                                          {booking.bookingId || booking._id.slice(-6).toUpperCase()}
                                                                                 </td>
                                                                                 <td className="px-6 py-4">
                                                                                          <div className="font-medium text-gray-800">{booking.vehicle?.name || 'Unknown'}</div>
                                                                                          <div className="text-xs text-gray-500">{booking.vehicle?.brand}</div>
                                                                                 </td>
                                                                                 <td className="px-6 py-4">
                                                                                          <div className="text-gray-800">{booking.user?.username || 'Guest'}</div>
                                                                                          <div className="text-xs text-gray-500">{booking.user?.phone || booking.user?.email}</div>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-sm text-gray-600">
                                                                                          <div>{new Date(booking.pickupDate).toLocaleDateString()}</div>
                                                                                          <div className="text-xs text-gray-400">to {new Date(booking.dropoffDate).toLocaleDateString()}</div>
                                                                                 </td>
                                                                                 <td className="px-6 py-4">
                                                                                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                                                   booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                                                                     'bg-red-100 text-red-700'
                                                                                                   }`}>
                                                                                                   {booking.status}
                                                                                          </span>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-right font-medium text-gray-800">
                                                                                          ₹ {booking.totalPrice?.toLocaleString()}
                                                                                 </td>
                                                                        </tr>
                                                               )) : (
                                                                        <tr>
                                                                                 <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                                                          No bookings found.
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

export default Bookings;
