import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicleById, clearCurrentVehicle } from '../store/slices/vehicleSlice';
import { createBooking } from '../store/slices/bookingSlice';
import { createCheckoutSession } from '../store/slices/bookingSlice';
import Loader from '../components/Loader';
import { FaCar, FaMotorcycle, FaMapMarkerAlt, FaCalendar, FaDollarSign } from 'react-icons/fa';
// Stripe will be loaded dynamically when needed

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentVehicle, loading } = useSelector((state) => state.vehicles);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.bookings);

  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    dropoffDate: '',
    pickupLocation: '',
    dropoffLocation: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchVehicleById(id));
    return () => {
      dispatch(clearCurrentVehicle());
    };
  }, [dispatch, id]);

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!bookingData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!bookingData.dropoffDate) newErrors.dropoffDate = 'Dropoff date is required';
    if (!bookingData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required';
    if (!bookingData.dropoffLocation) newErrors.dropoffLocation = 'Dropoff location is required';

    if (bookingData.pickupDate && bookingData.dropoffDate) {
      const pickup = new Date(bookingData.pickupDate);
      const dropoff = new Date(bookingData.dropoffDate);
      if (dropoff <= pickup) {
        newErrors.dropoffDate = 'Dropoff date must be after pickup date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalPrice = () => {
    if (!currentVehicle || !bookingData.pickupDate || !bookingData.dropoffDate) return 0;
    const pickup = new Date(bookingData.pickupDate);
    const dropoff = new Date(bookingData.dropoffDate);
    const diffTime = Math.abs(dropoff - pickup);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return totalDays * currentVehicle.pricePerDay;
  };

  const handleBookNow = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    try {
      const booking = await dispatch(
        createBooking({
          vehicle: id,
          ...bookingData,
        })
      ).unwrap();

      // Create Stripe checkout session
      const session = await dispatch(createCheckoutSession(booking._id)).unwrap();

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      alert(error || 'Failed to create booking');
    }
  };

  if (loading) return <Loader />;
  if (!currentVehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Vehicle not found</p>
      </div>
    );
  }

  // Default placeholder images
  const defaultCarImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
  const defaultBikeImage = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';
  
  // Get image URL with proper fallback
  const getImageUrl = () => {
    if (currentVehicle.images && currentVehicle.images.length > 0 && currentVehicle.images[0]) {
      const url = currentVehicle.images[0];
      // Check if it's a valid URL (starts with http:// or https://)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
    }
    return currentVehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
  };
  
  const imageUrl = getImageUrl();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={imageUrl}
                alt={currentVehicle.name || 'Vehicle'}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  // Prevent infinite loop by checking if already using fallback
                  if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
                    e.target.src = currentVehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                  }
                }}
                loading="eager"
              />
            </div>
            {currentVehicle.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {currentVehicle.images.slice(1, 5).map((img, idx) => {
                  const thumbnailUrl = (img && (img.startsWith('http://') || img.startsWith('https://'))) 
                    ? img 
                    : (currentVehicle.type === 'car' ? defaultCarImage : defaultBikeImage);
                  return (
                    <img
                      key={idx}
                      src={thumbnailUrl}
                      alt={`${currentVehicle.name} ${idx + 2}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                      onError={(e) => {
                        if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
                          e.target.src = currentVehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                        }
                      }}
                      loading="lazy"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{currentVehicle.name}</h1>
                <span className="text-2xl font-bold text-blue-600">
                  ${currentVehicle.pricePerDay}/day
                </span>
              </div>

              <p className="text-xl text-gray-600 mb-4">
                {currentVehicle.brand} {currentVehicle.model} ({currentVehicle.year})
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600">
                  {currentVehicle.type === 'car' ? (
                    <FaCar className="mr-2" />
                  ) : (
                    <FaMotorcycle className="mr-2" />
                  )}
                  <span className="capitalize">{currentVehicle.type}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{currentVehicle.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span>Fuel: {currentVehicle.fuelType}</span>
                </div>
                {currentVehicle.seats && (
                  <div className="flex items-center text-gray-600">
                    <span>Seats: {currentVehicle.seats}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <span>Transmission: {currentVehicle.transmission}</span>
                </div>
              </div>

              {currentVehicle.description && (
                <p className="text-gray-700 mb-6">{currentVehicle.description}</p>
              )}

              {currentVehicle.features?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentVehicle.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${
                currentVehicle.available
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentVehicle.available ? 'Available' : 'Unavailable'}
              </div>
            </div>

            {/* Booking Form */}
            {currentVehicle.available && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Book This Vehicle</h2>
                <form onSubmit={handleBookNow} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={bookingData.pickupDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.pickupDate ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.pickupDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dropoff Date
                    </label>
                    <input
                      type="date"
                      name="dropoffDate"
                      value={bookingData.dropoffDate}
                      onChange={handleInputChange}
                      min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.dropoffDate ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.dropoffDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.dropoffDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      value={bookingData.pickupLocation}
                      onChange={handleInputChange}
                      placeholder="Enter pickup location"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.pickupLocation
                          ? 'border-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.pickupLocation && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dropoff Location
                    </label>
                    <input
                      type="text"
                      name="dropoffLocation"
                      value={bookingData.dropoffLocation}
                      onChange={handleInputChange}
                      placeholder="Enter dropoff location"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.dropoffLocation
                          ? 'border-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.dropoffLocation && (
                      <p className="text-red-500 text-sm mt-1">{errors.dropoffLocation}</p>
                    )}
                  </div>

                  {totalPrice > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Total Price:</span>
                        <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    {isAuthenticated ? 'Proceed to Payment' : 'Login to Book'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;

