import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const KYCCallback = () => {
         const navigate = useNavigate();
         const [files, setFiles] = useState({
                  aadharCard: null,
                  panCard: null
         });

         const handleFileChange = (e) => {
                  setFiles({ ...files, [e.target.name]: e.target.files[0] });
         };

         const handleSubmit = async (e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  if (files.aadharCard) formData.append('aadharCard', files.aadharCard);
                  if (files.panCard) formData.append('panCard', files.panCard); // Ideally backend should accept panCard too, currently it accepts 'drivingLicense' and 'aadharCard' in upload-documents. 
                  // We need to update backend to accept 'panCard' or map it correctly.
                  // For now, let's stick to what schema has: kycDetails images. 
                  // But the route /api/auth/upload-documents expects 'drivingLicense' and 'aadharCard' fields.
                  // We should PROBABLY create a specific route for Partner KYC or update the generic one.
                  // Let's assume we update backend or use a new route.
                  // For this step, I will create the frontend assuming a matching backend route.

                  try {
                           // We need a specific KYC upload endpoint or modify existing one.
                           // Let's use the existing one but we might need to change field names or update backend.
                           // Wait, Implementation Plan Phase 2 step 7: "Update User Schema... kycDetails: { aadharCard, panCard }".
                           // The existing backend route /upload-documents handles 'drivingLicense' and 'aadharCard'.
                           // It updates `user.drivingLicense` and `user.aadharCard`.
                           // But my new schema has `kycDetails`.
                           // I should Create a NEW route for partner KYC upload or update the existing one.
                           // I'll create a new route in backend in next steps or just reuse and fix later.
                           // Let's assume there is a route /api/auth/kyc-upload.

                           const token = localStorage.getItem('token');
                           await api.post('/auth/kyc-upload', formData, {
                                    headers: {
                                             'Content-Type': 'multipart/form-data',
                                             'Authorization': `Bearer ${token}`
                                    }
                           });
                           toast.success('KYC Documents Uploaded');
                           navigate('/dashboard');
                  } catch (err) {
                           toast.error('Upload failed');
                  }
         };

         return (
                  <div className="min-h-screen flex items-center justify-center bg-gray-100">
                           <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                                    <h2 className="text-2xl font-bold mb-6 text-center">Partner Verification (KYC)</h2>
                                    <form onSubmit={handleSubmit}>
                                             <div className="mb-4">
                                                      <label className="block text-gray-700">Aadhaar Card (Image)</label>
                                                      <input
                                                               type="file"
                                                               name="aadharCard"
                                                               onChange={handleFileChange}
                                                               className="w-full border rounded p-2"
                                                               required
                                                      />
                                             </div>
                                             <div className="mb-6">
                                                      <label className="block text-gray-700">PAN Card (Image)</label>
                                                      <input
                                                               type="file"
                                                               name="panCard"
                                                               onChange={handleFileChange}
                                                               className="w-full border rounded p-2"
                                                               required
                                                      />
                                             </div>
                                             <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                                                      Submit for Verification
                                             </button>
                                    </form>
                           </div>
                  </div>
         );
};

export default KYCCallback;
