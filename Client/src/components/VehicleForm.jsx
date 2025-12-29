import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createVehicle, updateVehicle } from '../store/slices/vehicleSlice';

const VehicleForm = ({ vehicle, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    type: 'car',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    pricePerDay: '',
    fuelType: 'petrol',
    seats: '',
    transmission: 'manual',
    color: '',
    registrationNumber: '',
    vin: '',
    odometerKm: '',
    fuelEconomy: '',
    insuranceExpiry: '',
    documents: [],
    description: '',
    location: '',
    available: true,
    images: [],
    features: [],
  });

  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name || '',
        type: vehicle.type || 'car',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        pricePerDay: vehicle.pricePerDay || '',
        fuelType: vehicle.fuelType || 'petrol',
        seats: vehicle.seats || '',
        transmission: vehicle.transmission || 'manual',
        color: vehicle.color || '',
        registrationNumber: vehicle.registrationNumber || '',
        vin: vehicle.vin || '',
        odometerKm: vehicle.odometerKm || '',
        fuelEconomy: vehicle.fuelEconomy || '',
        insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().slice(0, 10) : '',
        documents: vehicle.documents || [],
        description: vehicle.description || '',
        location: vehicle.location || '',
        available: vehicle.available !== undefined ? vehicle.available : true,
        images: vehicle.images || [],
        features: vehicle.features || [],
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const urls = e.target.value.split(',').map((url) => url.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      images: urls,
    }));
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
    try {
      // Normalize values before send
      const payload = { ...formData };
      if (payload.odometerKm === '' || payload.odometerKm === null) delete payload.odometerKm; else payload.odometerKm = Number(payload.odometerKm);
      if (payload.fuelEconomy === '' || payload.fuelEconomy === null) delete payload.fuelEconomy; else payload.fuelEconomy = Number(payload.fuelEconomy);
      if (!payload.insuranceExpiry) delete payload.insuranceExpiry;
      if (payload.documents && payload.documents.length === 0) delete payload.documents;

      if (vehicle) {
        await dispatch(updateVehicle({ id: vehicle._id, data: payload })).unwrap();
      } else {
        await dispatch(createVehicle(payload)).unwrap();
      }
      onSuccess();
    } catch (error) {
      alert(error || 'Failed to save vehicle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
          <input
            type="text"
            name="brand"
            required
            value={formData.brand}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
          <input
            type="text"
            name="model"
            required
            value={formData.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
          <input
            type="number"
            name="year"
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day *</label>
          <input
            type="number"
            name="pricePerDay"
            required
            min="0"
            step="0.01"
            value={formData.pricePerDay}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
          <input
            type="number"
            name="seats"
            min="1"
            value={formData.seats}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images (comma-separated URLs)
        </label>
        <input
          type="text"
          value={formData.images.join(', ')}
          onChange={handleImageChange}
          placeholder="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800, https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Tip: Use Unsplash URLs for free high-quality images. Separate multiple URLs with commas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
          <input
            type="number"
            name="odometerKm"
            min="0"
            value={formData.odometerKm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Economy (km/l)</label>
          <input
            type="number"
            name="fuelEconomy"
            step="0.1"
            min="0"
            value={formData.fuelEconomy}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
          <input
            type="date"
            name="insuranceExpiry"
            value={formData.insuranceExpiry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Documents (comma-separated URLs)</label>
          <input
            type="text"
            value={formData.documents.join(', ')}
            onChange={(e) => {
              const urls = e.target.value.split(',').map((u) => u.trim()).filter(Boolean);
              setFormData((prev) => ({ ...prev, documents: urls }));
            }}
            placeholder="https://example.com/rc.pdf, https://example.com/insurance.pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
            placeholder="Add feature"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {formData.features.map((feature, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {feature}
              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-700">Available</label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {vehicle ? 'Update' : 'Create'} Vehicle
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;

