import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaEdit, FaTrash, FaCar } from 'react-icons/fa';
import { getVehicleImageUrl, DEFAULT_CAR_IMAGE, DEFAULT_BIKE_IMAGE } from '../utils/imageUtils';

const MyVehicles = () => {
         const navigate = useNavigate();
         const [vehicles, setVehicles] = useState([]);
         const [loading, setLoading] = useState(true);

         useEffect(() => {
                  fetchVehicles();
         }, []);

         const fetchVehicles = async () => {
                  try {
                           const res = await api.get('/vehicles/my-vehicles');
                           setVehicles(res.data);
                  } catch (err) {
                           console.error(err);
                  } finally {
                           setLoading(false);
                  }
         };

         const getStatusColor = (status) => {
                  switch (status) {
                           case 'Approved': return 'bg-green-100 text-green-800';
                           case 'Rejected': return 'bg-red-100 text-red-800';
                           default: return 'bg-yellow-100 text-yellow-800';
                  }
         };

         if (loading) return <div className="p-8 text-center text-gray-500">Loading vehicles...</div>;

         return (
                  <div>
                           <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">My Vehicles</h2>
                                    <span className="text-gray-500 text-sm">Total: {vehicles.length}</span>
                           </div>

                           {vehicles.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                             <FaCar className="mx-auto text-4xl text-gray-300 mb-4" />
                                             <h3 className="text-lg font-medium text-gray-900">No vehicles listed yet</h3>
                                             <p className="text-gray-500 mt-1">Start by adding your first vehicle to the platform.</p>
                                    </div>
                           ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                             {vehicles.map((vehicle) => (
                                                      <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                                               <div className="h-48 bg-gray-200 relative">
                                                                        <img
                                                                                 src={getVehicleImageUrl(vehicle)}
                                                                                 alt={vehicle.name}
                                                                                 className="w-full h-full object-cover"
                                                                                 onError={(e) => {
                                                                                          const fallback = vehicle.type === 'bike' ? DEFAULT_BIKE_IMAGE : DEFAULT_CAR_IMAGE;
                                                                                          if (e.target.src !== fallback) {
                                                                                                   e.target.src = fallback;
                                                                                          }
                                                                                 }}
                                                                        />
                                                                        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(vehicle.status || 'Pending')}`}>
                                                                                 {vehicle.status || 'Pending'}
                                                                        </span>
                                                               </div>

                                                               <div className="p-5">
                                                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{vehicle.brand} {vehicle.name}</h3>
                                                                        <p className="text-gray-500 text-sm mb-4">{vehicle.location}</p>

                                                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                                                 <span className="text-blue-600 font-bold">₹{vehicle.pricePerDay}<span className="text-xs font-normal text-gray-500">/day</span></span>
                                                                                 <div className="flex space-x-2">
                                                                                          <button
                                                                                                   onClick={() => navigate(`/edit-vehicle/${vehicle._id}`)}
                                                                                                   className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                                                                                                   title="Edit Vehicle"
                                                                                          >
                                                                                                   <FaEdit />
                                                                                          </button>
                                                                                          <button className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors">
                                                                                                   <FaTrash />
                                                                                          </button>
                                                                                 </div>
                                                                        </div>
                                                               </div>
                                                      </div>
                                             ))}
                                    </div>
                           )}
                  </div>
         );
};

export default MyVehicles;
