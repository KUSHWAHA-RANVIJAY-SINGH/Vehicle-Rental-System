import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaSearch, FaUser } from 'react-icons/fa';

const AdminUsers = () => {
         const [users, setUsers] = useState([]);
         const [loading, setLoading] = useState(true);
         const [searchTerm, setSearchTerm] = useState('');

         useEffect(() => {
                  fetchUsers();
         }, []);

         const fetchUsers = async () => {
                  try {
                           const res = await api.get('/auth/users');
                           setUsers(res.data);
                  } catch (error) {
                           toast.error('Failed to load users');
                           console.error(error);
                  } finally {
                           setLoading(false);
                  }
         };

         const filteredUsers = users.filter(u =>
                  u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchTerm.toLowerCase())
         );

         if (loading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

         return (
                  <div className="space-y-6">
                           <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                                    <div className="relative">
                                             <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                             <input
                                                      type="text"
                                                      placeholder="Search users..."
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
                                                                        <th className="px-6 py-4 font-semibold">User</th>
                                                                        <th className="px-6 py-4 font-semibold">Email</th>
                                                                        <th className="px-6 py-4 font-semibold">Phone</th>
                                                                        <th className="px-6 py-4 font-semibold">Documents</th>
                                                                        <th className="px-6 py-4 font-semibold">Joined</th>
                                                               </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-gray-100">
                                                               {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                                                 <td className="px-6 py-4">
                                                                                          <div className="flex items-center space-x-3">
                                                                                                   <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                                                                            <FaUser />
                                                                                                   </div>
                                                                                                   <div>
                                                                                                            <div className="font-medium text-gray-800">{user.username}</div>
                                                                                                            <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                                                                                                   </div>
                                                                                          </div>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                                                                 <td className="px-6 py-4 text-gray-600">{user.phone || 'N/A'}</td>
                                                                                 <td className="px-6 py-4">
                                                                                          <span className={`px-2 py-1 rounded text-xs ${user.drivingLicense ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                                                   DL
                                                                                          </span>
                                                                                          <span className={`ml-2 px-2 py-1 rounded text-xs ${user.aadharCard ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                                                   Aadhar
                                                                                          </span>
                                                                                 </td>
                                                                                 <td className="px-6 py-4 text-gray-600">
                                                                                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                                                 </td>
                                                                        </tr>
                                                               )) : (
                                                                        <tr>
                                                                                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                                                          No users found.
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

export default AdminUsers;
