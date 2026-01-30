import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaSearch } from 'react-icons/fa';

const AdminPartners = () => {
         const [partners, setPartners] = useState([]);
         const [loading, setLoading] = useState(true);
         const [searchTerm, setSearchTerm] = useState('');

         useEffect(() => {
                  fetchPartners();
         }, []);

         const fetchPartners = async () => {
                  try {
                           const res = await api.get('/auth/partners');
                           // Ensure specific fields exist to avoid errors
                           const validPartners = res.data.map(p => ({
                                    ...p,
                                    partnerDetails: p.partnerDetails || {}
                           }));
                           setPartners(validPartners);
                  } catch (error) {
                           toast.error('Failed to load partners');
                           console.error(error);
                  } finally {
                           setLoading(false);
                  }
         };

         const verifyPartner = async (id, isVerified) => {
                  try {
                           const res = await api.put(`/auth/partners/${id}/verify`, { isVerified });
                           setPartners(partners.map(p => p._id === id ? { ...p, isVerified: res.data.isVerified } : p));
                           toast.success(`Partner ${isVerified ? 'Verified' : 'Rejected'}`);
                  } catch (error) {
                           toast.error('Failed to update status');
                  }
         };

         const filteredPartners = partners.filter(p =>
                  p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.email.toLowerCase().includes(searchTerm.toLowerCase())
         );

         if (loading) return <div className="p-8 text-center text-gray-500">Loading Partners...</div>;

         return (
                  <div className="space-y-6">
                           <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">Partner Management</h2>
                                    <div className="relative">
                                             <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                             <input
                                                      type="text"
                                                      placeholder="Search partners..."
                                                      value={searchTerm}
                                                      onChange={(e) => setSearchTerm(e.target.value)}
                                                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                             />
                                    </div>
                           </div>

                           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                             <table className="w-full text-left">
                                                      <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                                                               <tr>
                                                                        <th className="px-6 py-4 font-semibold">Name</th>
                                                                        <th className="px-6 py-4 font-semibold">Email</th>
                                                                        <th className="px-6 py-4 font-semibold">Bank Details</th>
                                                                        <th className="px-6 py-4 font-semibold">Status</th>
                                                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                               </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-100">
                                                               {filteredPartners.length > 0 ? filteredPartners.map((partner) => (
                                                                        <tr key={partner._id} className="hover:bg-gray-50 transition-colors">
                                                                                 <td className="px-6 py-4">
                                                                                          <div className="font-medium text-gray-800">{partner.username}</div>
                                                                                          <div className="text-xs text-gray-500">{partner.phone}</div>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-gray-600">{partner.email}</td>
                                                                                 <td className="px-6 py-4 text-sm text-gray-600">
                                                                                          {partner.partnerDetails?.bankAccountName ? (
                                                                                                   <>
                                                                                                            <div>{partner.partnerDetails.bankName}</div>
                                                                                                            <div className="text-xs text-gray-400">{partner.partnerDetails.accountNumber}</div>
                                                                                                   </>
                                                                                          ) : (
                                                                                                   <span className="text-gray-400 italic">Not provided</span>
                                                                                          )}
                                                                                 </td>
                                                                                 <td className="px-6 py-4">
                                                                                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${partner.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                                                                   }`}>
                                                                                                   {partner.isVerified ? 'Verified' : 'Pending'}
                                                                                          </span>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-right space-x-2">
                                                                                          {!partner.isVerified ? (
                                                                                                   <button
                                                                                                            onClick={() => verifyPartner(partner._id, true)}
                                                                                                            className="text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors"
                                                                                                            title="Approve"
                                                                                                   >
                                                                                                            <FaCheck />
                                                                                                   </button>
                                                                                          ) : (
                                                                                                   <button
                                                                                                            onClick={() => verifyPartner(partner._id, false)}
                                                                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                                                                            title="Revoke Verification"
                                                                                                   >
                                                                                                            <FaTimes />
                                                                                                   </button>
                                                                                          )}
                                                                                 </td>
                                                                        </tr>
                                                               )) : (
                                                                        <tr>
                                                                                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                                                          No partners found matching your search.
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

export default AdminPartners;
