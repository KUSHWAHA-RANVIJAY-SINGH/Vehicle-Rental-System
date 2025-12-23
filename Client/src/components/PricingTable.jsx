import React from 'react';
import { FaCar, FaMotorcycle } from 'react-icons/fa';

const PricingTable = ({ vehicles }) => {
         if (!vehicles || vehicles.length === 0) {
                  return <div className="text-center py-4">No pricing data available.</div>;
         }

         return (
                  <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                           <table className="w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-50 text-gray-800 font-semibold uppercase border-b">
                                             <tr>
                                                      <th className="px-6 py-4">Fleet</th>
                                                      <th className="px-6 py-4 text-center" colSpan="3">Daily Rental Pricing starting from</th>
                                             </tr>
                                             <tr className="border-b">
                                                      <th className="px-6 py-3"></th>
                                                      <th className="px-6 py-3 text-center bg-gray-50/50">120 Kms</th>
                                                      <th className="px-6 py-3 text-center bg-gray-50/50">300 Kms</th>
                                                      <th className="px-6 py-3 text-center bg-gray-50/50">Unlimited Kms</th>
                                             </tr>
                                    </thead>
                                    <tbody>
                                             {vehicles.map((vehicle, index) => (
                                                      <tr
                                                               key={vehicle._id}
                                                               className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                                                                        }`}
                                                      >
                                                               <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                                        {vehicle.type === 'bike' ? (
                                                                                 <FaMotorcycle className="text-blue-600 text-lg" />
                                                                        ) : (
                                                                                 <FaCar className="text-blue-600 text-lg" />
                                                                        )}
                                                                        {vehicle.name}
                                                               </td>
                                                               <td className="px-6 py-4 text-center">
                                                                        {vehicle.rentalOptions?.daily?.limit120?.price
                                                                                 ? `₹ ${vehicle.rentalOptions.daily.limit120.price}`
                                                                                 : (vehicle.pricePerDay ? `₹ ${Math.round(vehicle.pricePerDay * 0.85)}` : '-')}
                                                               </td>
                                                               <td className="px-6 py-4 text-center font-medium text-blue-700 bg-blue-50/30">
                                                                        {vehicle.rentalOptions?.daily?.limit300?.price
                                                                                 ? `₹ ${vehicle.rentalOptions.daily.limit300.price}`
                                                                                 : (vehicle.pricePerDay ? `₹ ${vehicle.pricePerDay}` : '-')}
                                                               </td>
                                                               <td className="px-6 py-4 text-center">
                                                                        {vehicle.rentalOptions?.daily?.unlimited?.price
                                                                                 ? `₹ ${vehicle.rentalOptions.daily.unlimited.price}`
                                                                                 : (vehicle.pricePerDay ? `₹ ${Math.round(vehicle.pricePerDay * 1.3)}` : '-')}
                                                               </td>
                                                      </tr>
                                             ))}
                                    </tbody>
                           </table>
                           <div className="p-4 text-xs text-gray-500 border-t">
                                    *Note - Price shown here may vary as per market dynamics.
                           </div>
                  </div>
         );
};

export default PricingTable;
