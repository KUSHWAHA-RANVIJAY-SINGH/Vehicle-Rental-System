import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaUser, FaBuilding, FaIdCard, FaSpinner } from 'react-icons/fa';

const Profile = () => {
         const [loading, setLoading] = useState(true);
         const [saving, setSaving] = useState(false);
         const [user, setUser] = useState(null);
         const [formData, setFormData] = useState({
                  username: '',
                  email: '',
                  phone: '',
                  address: '',
                  bankName: '',
                  bankAccount: '',
                  ifsc: '',
                  panCard: ''
         });

         useEffect(() => {
                  fetchProfile();
         }, []);

         const fetchProfile = async () => {
                  try {
                           const res = await api.get('/auth/partner/profile');
                           setUser(res.data);
                           setFormData({
                                    username: res.data.username || '',
                                    email: res.data.email || '',
                                    phone: res.data.phone || '',
                                    address: res.data.address || '',
                                    bankName: res.data.partnerDetails?.bankName || '',
                                    bankAccount: res.data.partnerDetails?.bankAccount || '',
                                    ifsc: res.data.partnerDetails?.ifsc || '',
                                    panCard: res.data.partnerDetails?.panCard || ''
                           });
                  } catch (err) {
                           toast.error('Failed to load profile');
                  } finally {
                           setLoading(false);
                  }
         };

         const handleChange = (e) => {
                  setFormData({ ...formData, [e.target.name]: e.target.value });
         };

         const handleSubmit = async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                           // NOTE: backend update route might need adjustment to handle partnerDetails specifically if it's nested
                           // Looking at authRoutes.js Step 234: PUT /profile updates basic fields.
                           // It DOES NOT update partnerDetails yet. I will need to update the backend route too.
                           // For now, I'll send what I can.
                           const res = await api.put('/auth/partner/profile', {
                                    ...formData,
                                    partnerDetails: {
                                             bankName: formData.bankName,
                                             bankAccount: formData.bankAccount,
                                             ifsc: formData.ifsc,
                                             panCard: formData.panCard
                                    }
                           });
                           setUser(res.data);
                           toast.success('Profile updated successfully');
                  } catch (err) {
                           toast.error(err.response?.data?.message || 'Update failed');
                  } finally {
                           setSaving(false);
                  }
         };

         if (loading) return <div className="flex justify-center p-12"><FaSpinner className="animate-spin text-4xl text-blue-600" /></div>;

         return (
                  <div className="max-w-4xl mx-auto">
                           <h2 className="text-2xl font-bold text-gray-800 mb-6">Partner Profile</h2>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* User Card */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                                             <div className="flex flex-col items-center">
                                                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                                                               {user?.username?.charAt(0).toUpperCase()}
                                                      </div>
                                                      <h3 className="text-xl font-bold text-gray-800">{user?.username}</h3>
                                                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-2 font-medium capitalize">
                                                               {user?.role}
                                                      </span>
                                                      <div className="mt-4 w-full text-center p-3 bg-gray-50 rounded-lg">
                                                               <p className="text-gray-500 text-xs uppercase font-semibold">Verification Status</p>
                                                               <p className={`font-bold ${user?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                                                        {user?.isVerified ? 'Verified' : 'Pending'}
                                                               </p>
                                                      </div>
                                             </div>
                                    </div>

                                    {/* Edit Form */}
                                    <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                             <form onSubmit={handleSubmit} className="space-y-6">

                                                      <div className="border-b pb-4 mb-4">
                                                               <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
                                                                        <FaUser className="mr-2" /> Personal Information
                                                               </h4>
                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                                                                                 <input name="username" value={formData.username} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                                                        </div>
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                                                                 <input name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" disabled />
                                                                        </div>
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                                                                                 <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                                                        </div>
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                                                                                 <input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                                                        </div>
                                                               </div>
                                                      </div>

                                                      <div>
                                                               <h4 className="text-lg font-semibold text-gray-700 flex items-center mb-4">
                                                                        <FaBuilding className="mr-2" /> Bank & Business Details
                                                               </h4>
                                                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                                                                                 <input name="bankName" value={formData.bankName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. HDFC Bank" />
                                                                        </div>
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">Bank Account Number</label>
                                                                                 <input name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="XXXXXXXXXXXX" />
                                                                        </div>
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">IFSC Code</label>
                                                                                 <input name="ifsc" value={formData.ifsc} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="ABCD0123456" />
                                                                        </div>
                                                                        <div>
                                                                                 <label className="block text-sm font-medium text-gray-600 mb-1">PAN Card Number</label>
                                                                                 <input name="panCard" value={formData.panCard} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="ABCDE1234F" />
                                                                        </div>
                                                               </div>
                                                      </div>

                                                      <div className="flex justify-end pt-4">
                                                               <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                                        {saving ? 'Saving...' : 'Save Changes'}
                                                               </button>
                                                      </div>
                                             </form>
                                    </div>
                           </div>
                  </div>
         );
};

export default Profile;
