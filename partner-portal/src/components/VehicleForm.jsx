import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaTimes, FaMagic } from 'react-icons/fa';

const VehicleForm = ({ vehicle, onSuccess }) => {
         const [formData, setFormData] = useState({
                  name: '',
                  type: 'car',
                  brand: '',
                  model: '',
                  engineCC: '',
                  year: new Date().getFullYear(),
                  pricePerDay: '',
                  fuelType: 'petrol',
                  seats: 4,
                  transmission: 'manual',
                  location: '',
                  description: '',
                  color: '',
                  registrationNumber: '',
                  vin: '',
                  odometerKm: '',
                  fuelEconomy: '',
                  insuranceExpiry: '',
                  features: [],
                  available: true,
         });

         const [images, setImages] = useState([]); // File objects
         const [imageUrls, setImageUrls] = useState(''); // String input for URLs
         const [existingImages, setExistingImages] = useState([]); // URLs from backend (for edit)
         const [featureInput, setFeatureInput] = useState('');

         const [loading, setLoading] = useState(false);
         const [generating, setGenerating] = useState(false);

         useEffect(() => {
                  if (vehicle) {
                           setFormData({
                                    name: vehicle.name || '',
                                    type: vehicle.type || 'car',
                                    brand: vehicle.brand || '',
                                    model: vehicle.model || '',
                                    engineCC: vehicle.engineCC || '',
                                    year: vehicle.year || new Date().getFullYear(),
                                    pricePerDay: vehicle.pricePerDay || '',
                                    fuelType: vehicle.fuelType || 'petrol',
                                    seats: vehicle.seats || '',
                                    transmission: vehicle.transmission || 'manual',
                                    location: vehicle.location || '',
                                    description: vehicle.description || '',
                                    color: vehicle.color || '',
                                    registrationNumber: vehicle.registrationNumber || '',
                                    vin: vehicle.vin || '',
                                    odometerKm: vehicle.odometerKm || '',
                                    fuelEconomy: vehicle.fuelEconomy || '',
                                    insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().slice(0, 10) : '',
                                    features: vehicle.features || [],
                                    available: vehicle.available !== undefined ? vehicle.available : true,
                           });
                           setExistingImages(vehicle.images || []);
                  }
         }, [vehicle]);

         const calculateMinPrice = (type, cc) => {
                  cc = Number(cc);
                  if (!cc || cc <= 0) return 0;

                  // Normalize type
                  const vehicleType = type ? type.toLowerCase() : 'car';

                  if (vehicleType === 'bike') {
                           // Bike: Base ₹400 (first 100cc) + ₹40 per extra 25cc
                           const basePrice = 400;
                           const baseCC = 100;
                           const ratePerExtra25CC = 40;

                           if (cc <= baseCC) return basePrice;

                           const extraCC = cc - baseCC;
                           const extraSlabs = Math.ceil(extraCC / 25);
                           return basePrice + (extraSlabs * ratePerExtra25CC);
                  } else {
                           // Car: Base ₹2000 (first 800cc) + ₹100 per extra 25cc
                           // Defaulting to car logic if type is unknown or 'car'
                           const basePrice = 2000;
                           const baseCC = 800;
                           const ratePerExtra25CC = 100;

                           if (cc <= baseCC) return basePrice;

                           const extraCC = cc - baseCC;
                           const extraSlabs = Math.ceil(extraCC / 25);
                           return basePrice + (extraSlabs * ratePerExtra25CC);
                  }
         };

         const handleChange = (e) => {
                  const { name, value, type, checked } = e.target;

                  if (name === 'engineCC') {
                           // Remove automatic price update
                           setFormData((prev) => ({
                                    ...prev,
                                    [name]: value,
                           }));
                  } else {
                           setFormData((prev) => ({
                                    ...prev,
                                    [name]: type === 'checkbox' ? checked : value,
                           }));
                  }
         };

         const handleImageChange = (e) => {
                  if (e.target.files) {
                           setImages([...images, ...Array.from(e.target.files)]);
                  }
         };

         const removeImage = (index) => {
                  setImages(images.filter((_, i) => i !== index));
         };

         const removeExistingImage = (index) => {
                  setExistingImages(existingImages.filter((_, i) => i !== index));
         };

         const handleAddFeature = () => {
                  if (featureInput.trim()) {
                           setFormData((prev) => ({
                                    ...prev,
                                    features: [...prev.features, featureInput.trim()],
                           }));
                           setFeatureInput('');
                  }
         };

         const handleRemoveFeature = (index) => {
                  setFormData((prev) => ({
                           ...prev,
                           features: prev.features.filter((_, i) => i !== index),
                  }));
         };

         const handleSubmit = async (e) => {
                  e.preventDefault();

                  // Final Validation for Price
                  // Final Validation for Price
                  const minPrice = calculateMinPrice(formData.type, formData.engineCC);
                  if (Number(formData.pricePerDay) < minPrice) {
                           toast.error(`Price cannot be less than ₹${minPrice} for a ${formData.engineCC} CC ${formData.type}.`);
                           return;
                  }

                  setLoading(true);

                  try {
                           const data = new FormData();
                           Object.keys(formData).forEach(key => {
                                    if (key === 'features') {
                                             formData[key].forEach(f => data.append('features[]', f));
                                    } else {
                                             data.append(key, formData[key]);
                                    }
                           });

                           // 1. Append existing images (for edit mode) - IMPORTANT to keep them
                           if (vehicle && existingImages.length > 0) {
                                    existingImages.forEach(img => data.append('images', img));
                           }

                           // 2. Append newly uploaded files
                           images.forEach(image => data.append('images', image));

                           // 3. Append new URL inputs
                           if (imageUrls && imageUrls.trim()) {
                                    const urls = imageUrls.split(',').map(u => u.trim());
                                    urls.forEach(u => data.append('images', u));
                           }

                           if (vehicle) {
                                    // Use FormData for PUT as well to support image updates
                                    await api.put(`/vehicles/${vehicle._id}`, data, {
                                             headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    toast.success('Vehicle updated successfully');
                           } else {
                                    await api.post('/vehicles', data, {
                                             headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    toast.success('Vehicle added successfully');
                           }

                           if (onSuccess) onSuccess();
                  } catch (err) {
                           console.error(err);
                           toast.error(err.response?.data?.message || 'Operation failed');
                  } finally {
                           setLoading(false);
                  }
         };

         const handleGenerateDescription = async () => {
                  if (!formData.brand || !formData.model) {
                           toast.error('Please enter Brand and Model first.');
                           return;
                  }

                  try {
                           setGenerating(true);
                           const { data } = await api.post('/ai/generate-description', {
                                    brand: formData.brand,
                                    model: formData.model,
                                    features: formData.features
                           });
                           setFormData(prev => ({ ...prev, description: data.description }));
                           toast.success('Description generated!');
                  } catch (error) {
                           console.error('AI generation error:', error);
                           const errorMsg = error.response?.data?.error || error.response?.data?.details || 'Failed to generate description.';
                           toast.error(errorMsg);
                  } finally {
                           setGenerating(false);
                  }
         };

         return (
                  <form onSubmit={handleSubmit} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Vehicle Name *</label>
                                             <input
                                                      name="name"
                                                      value={formData.name}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                             />
                                    </div>

                                    {/* Type */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Type *</label>
                                             <select
                                                      name="type"
                                                      value={formData.type}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             >
                                                      <option value="car">Car</option>
                                                      <option value="bike">Bike</option>
                                             </select>
                                    </div>

                                    {/* Brand */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Brand *</label>
                                             <input
                                                      name="brand"
                                                      value={formData.brand}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                             />
                                    </div>

                                    {/* Model */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Model *</label>
                                             <input
                                                      name="model"
                                                      value={formData.model}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                             />
                                    </div>

                                    {/* Engine CC */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Engine CC *</label>
                                             <input
                                                      type="number"
                                                      name="engineCC"
                                                      value={formData.engineCC}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                                      placeholder="e.g. 150"
                                             />
                                             {formData.engineCC && (
                                                      <p className="text-sm text-blue-600 mt-1 font-medium bg-blue-50 p-2 rounded">
                                                               Minimum recommended price: ₹{calculateMinPrice(formData.type, formData.engineCC)}/day
                                                      </p>
                                             )}
                                    </div>

                                    {/* Year */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Year *</label>
                                             <input
                                                      type="number"
                                                      name="year"
                                                      value={formData.year}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                             />
                                    </div>

                                    {/* Price */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Price Per Day (₹) *</label>
                                             <input
                                                      type="number"
                                                      name="pricePerDay"
                                                      value={formData.pricePerDay}
                                                      onChange={handleChange}
                                                      min={calculateMinPrice(formData.type, formData.engineCC)}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                             />
                                             {formData.pricePerDay && (
                                                      <p className="text-xs text-green-600 mt-1 font-medium">
                                                               Platform Fee: 10% | You Earn: ₹{Math.round(formData.pricePerDay * 0.9)}/day
                                                      </p>
                                             )}
                                    </div>

                                    {/* Fuel Type */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Fuel Type</label>
                                             <select
                                                      name="fuelType"
                                                      value={formData.fuelType}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             >
                                                      <option value="petrol">Petrol</option>
                                                      <option value="diesel">Diesel</option>
                                                      <option value="electric">Electric</option>
                                                      <option value="hybrid">Hybrid</option>
                                             </select>
                                    </div>

                                    {/* Transmission */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Transmission</label>
                                             <select
                                                      name="transmission"
                                                      value={formData.transmission}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             >
                                                      <option value="manual">Manual</option>
                                                      <option value="automatic">Automatic</option>
                                             </select>
                                    </div>

                                    {/* Seats */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Seats</label>
                                             <input
                                                      type="number"
                                                      name="seats"
                                                      value={formData.seats}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             />
                                    </div>

                                    {/* Location */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Location *</label>
                                             <input
                                                      name="location"
                                                      value={formData.location}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                      required
                                             />
                                    </div>

                                    {/* Color */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Color</label>
                                             <input
                                                      name="color"
                                                      value={formData.color}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             />
                                    </div>

                                    {/* Registartion Number */}
                                    <div>
                                             <label className="block text-gray-700 font-medium mb-1">Registration Number</label>
                                             <input
                                                      name="registrationNumber"
                                                      value={formData.registrationNumber}
                                                      onChange={handleChange}
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             />
                                    </div>

                           </div>

                           {/* Description */}
                           <div>
                                    <div className="flex justify-between items-center mb-1">
                                             <label className="block text-gray-700 font-medium">Description</label>
                                             <button
                                                      type="button"
                                                      onClick={handleGenerateDescription}
                                                      disabled={generating}
                                                      className="text-sm flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                                             >
                                                      <FaMagic />
                                                      {generating ? 'Generating...' : 'Generate with AI'}
                                             </button>
                                    </div>
                                    <textarea
                                             name="description"
                                             value={formData.description}
                                             onChange={handleChange}
                                             rows="3"
                                             className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                           </div>

                           {/* Features */}
                           <div>
                                    <label className="block text-gray-700 font-medium mb-1">Features</label>
                                    <div className="flex space-x-2 mb-2">
                                             <input
                                                      type="text"
                                                      value={featureInput}
                                                      onChange={(e) => setFeatureInput(e.target.value)}
                                                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                                      placeholder="Add feature"
                                                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             />
                                             <button
                                                      type="button"
                                                      onClick={handleAddFeature}
                                                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                             >
                                                      Add
                                             </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                             {formData.features && formData.features.map((feature, index) => (
                                                      <span
                                                               key={index}
                                                               className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                                                      >
                                                               {feature}
                                                               <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveFeature(index)}
                                                                        className="ml-2 text-red-600 hover:text-red-800 font-bold"
                                                               >
                                                                        ×
                                                               </button>
                                                      </span>
                                             ))}
                                    </div>
                           </div>

                           {/* Image Upload */}
                           <div>
                                    <label className="block text-gray-700 font-medium mb-2">Images</label>

                                    {/* URL Input */}
                                    <div className="mb-4">
                                             <label className="block text-sm text-gray-600 mb-1">Image URLs (comma-separated)</label>
                                             <input
                                                      type="text"
                                                      value={imageUrls}
                                                      onChange={(e) => setImageUrls(e.target.value)}
                                                      placeholder="https://example.com/car.jpg, https://example.com/view.jpg"
                                                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                             />
                                             <p className="text-xs text-gray-500 mt-1">You can upload files below OR provide direct image links here.</p>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                                             <input
                                                      type="file"
                                                      multiple
                                                      onChange={handleImageChange}
                                                      className="hidden"
                                                      id="vehicle-images"
                                                      accept="image/*"
                                             />
                                             <label htmlFor="vehicle-images" className="cursor-pointer flex flex-col items-center justify-center">
                                                      <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                                                      <span className="text-blue-600 font-medium hover:underline">Click to upload images</span>
                                                      <p className="text-sm text-gray-500 mt-1">Support JPG, PNG</p>
                                             </label>
                                    </div>

                                    {/* Image Previews */}
                                    <div className="grid grid-cols-4 gap-4 mt-4">
                                             {existingImages.map((img, idx) => (
                                                      <div key={`existing-${idx}`} className="relative h-24 rounded-lg overflow-hidden group">
                                                               <img src={img} alt="Vehicle" className="w-full h-full object-cover" />
                                                               {!vehicle && ( // Only allow removing if we have logic for it
                                                                        <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                                                                                 <FaTimes size={12} />
                                                                        </button>
                                                               )}
                                                      </div>
                                             ))}
                                             {images.map((file, idx) => (
                                                      <div key={`new-${idx}`} className="relative h-24 rounded-lg overflow-hidden group">
                                                               <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                               <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                                                                        <FaTimes size={12} />
                                                               </button>
                                                      </div>
                                             ))}
                                    </div>
                           </div>

                           {/* Availability */}
                           <div className="flex items-center">
                                    <input
                                             type="checkbox"
                                             name="available"
                                             checked={formData.available}
                                             onChange={handleChange}
                                             className="mr-2 h-4 w-4"
                                    />
                                    <label className="text-gray-700 font-medium">Available for Booking</label>
                           </div>

                           {/* Submit */}
                           <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                           >
                                    {loading ? (vehicle ? 'Updating...' : 'Adding Vehicle...') : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
                           </button>
                  </form>
         );
};

export default VehicleForm;
