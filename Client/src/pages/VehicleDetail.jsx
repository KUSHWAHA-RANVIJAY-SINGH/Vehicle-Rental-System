import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicleById, clearCurrentVehicle } from '../store/slices/vehicleSlice';
import { createBooking } from '../store/slices/bookingSlice';
import { createCheckoutSession } from '../store/slices/bookingSlice';
import Loader from '../components/Loader';
import { FaCar, FaMotorcycle, FaMapMarkerAlt, FaCalendar, FaRupeeSign } from 'react-icons/fa';
import LocationPicker from '../components/LocationPicker';
// Stripe will be loaded dynamically when needed

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentVehicle, loading } = useSelector((state) => state.vehicles);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentBooking } = useSelector((state) => state.bookings);

  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    dropoffDate: '',
    pickupLocation: '',
    dropoffLocation: '',
  });

  const [bookingType, setBookingType] = useState('day'); // 'day' or 'km'
  const [selectedTier, setSelectedTier] = useState('unlimited'); // 'limit120', 'limit300', 'unlimited'
  const [wantsDriver, setWantsDriver] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [activeLocationField, setActiveLocationField] = useState(null); // 'pickup' or 'dropoff'

  const [errors, setErrors] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    dispatch(fetchVehicleById(id));

    // Fetch personalized recommendations for the authenticated user (if any)
    const fetchRecs = async () => {
      try {
        if (isAuthenticated && user?._id) {
          const { data } = await api.get(`/recommendations/user/${user._id}?limit=3`);
          setRecommendations(data.recommendations || []);
        }
      } catch (err) {
        console.warn('Could not fetch recommendations', err?.response?.data || err.message);
      }
    };

    fetchRecs();

    return () => {
      dispatch(clearCurrentVehicle());
    };
  }, [dispatch, id, isAuthenticated, user?._id]);

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

  const openMap = (field) => {
    setActiveLocationField(field);
    setShowMap(true);
  };

  const handleLocationSelect = (address) => {
    setBookingData({
      ...bookingData,
      [activeLocationField === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: address,
    });
    // Clear error
    const fieldName = activeLocationField === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
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

    // Get correct daily rate based on tier
    let dailyRate = currentVehicle.pricePerDay;

    if (currentVehicle.rentalOptions?.daily) {
      if (selectedTier === 'unlimited') dailyRate = currentVehicle.rentalOptions.daily.unlimited.price;
      else if (selectedTier === 'limit120') dailyRate = currentVehicle.rentalOptions.daily.limit120.price;
      else if (selectedTier === 'limit300') dailyRate = currentVehicle.rentalOptions.daily.limit300.price;
    }

    const pickup = new Date(bookingData.pickupDate);
    const dropoff = new Date(bookingData.dropoffDate);
    const diffTime = Math.abs(dropoff - pickup);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If same day return (0 days diff), charge for 1 day
    const chargeableDays = totalDays === 0 ? 1 : totalDays;

    let total = chargeableDays * dailyRate;

    if (wantsDriver) {
      total += 500 * chargeableDays;
    }

    return total;
  };

  const handleBookNow = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.drivingLicense || !user?.aadharCard) {
      alert('Please upload your Driving License and Aadhar Card in your dashboard before booking.');
      navigate('/dashboard');
      return;
    }

    if (!validateForm()) return;

    try {
      // 0. Check availability before creating booking to avoid payment failures
      const pickup = new Date(bookingData.pickupDate);
      const dropoff = new Date(bookingData.dropoffDate);
      try {
        const { data: availability } = await api.get(`/vehicles/${id}/availability?start=${encodeURIComponent(pickup.toISOString())}&end=${encodeURIComponent(dropoff.toISOString())}`);
        if (!availability.available) {
          const conflict = availability.conflict;
          alert(`Vehicle not available for selected dates${conflict ? ` (conflict: ${new Date(conflict.pickupDate).toLocaleDateString()} - ${new Date(conflict.dropoffDate).toLocaleDateString()})` : ''}`);
          return;
        }
      } catch (err) {
        // If availability check fails, proceed with caution but warn user
        console.warn('Availability check failed, proceeding with booking attempt', err);
      }

      // 1. Create Booking (pending)
      const diffTime = Math.abs(dropoff - pickup);
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const chargeableDays = days === 0 ? 1 : days;

      const booking = await dispatch(
        createBooking({
          vehicle: id,
          ...bookingData,
          withDriver: wantsDriver,
          totalDriverFee: wantsDriver ? (500 * chargeableDays) : 0
        })
      ).unwrap();

      // 2. Initiate Razorpay Order
      const { data: order } = await api.post('/bookings/create-order', {
        amount: totalPrice,
        receipt: `receipt_${booking._id}`
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vehicle Rental System",
        description: "Payment for Vehicle Booking",
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const { data: verifyData } = await api.post('/bookings/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id
            });

            if (verifyData.success) {
              alert('Payment Successful!');
              navigate('/dashboard');
            } else {
              alert('Payment Verification Failed');
            }
          } catch (error) {
            console.error(error);
            alert('Payment Verification Failed: ' + (error.response?.data?.message || error.message));
          }
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: user.phone || ""
        },
        notes: {
          address: "Razorpay Corporate Office"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        alert(response.error.description);
      });
      rzp1.open();

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Booking failed. Please try again.';
      alert(errorMessage);
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
                  ₹{currentVehicle.pricePerDay}/day
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

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Recommended for you</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {recommendations.map(rec => (
                      <div key={rec._id} className="bg-white rounded-lg p-3 shadow-sm">
                        <a href={`/vehicles/${rec._id}`} className="block">
                          <img src={(rec.images && rec.images[0]) || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop'} alt={rec.name} className="w-full h-36 object-cover rounded" />
                          <h4 className="mt-2 font-semibold text-sm">{rec.name}</h4>
                          <p className="text-xs text-gray-500">{rec.brand} • ₹{rec.pricePerDay}/day</p>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentVehicle.documents?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Documents:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {currentVehicle.documents.map((doc, idx) => (
                      <li key={idx}>
                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {doc}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${currentVehicle.available
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

                {/* Booking Options Toggle */}
                <div className="mb-6">
                  <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingType('day');
                        setSelectedTier('unlimited');
                      }}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${bookingType === 'day'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      Day Wise
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingType('km');
                        setSelectedTier('limit120');
                      }}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${bookingType === 'km'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      KM Wise
                    </button>
                  </div>

                  {/* Tier Selection for KM Wise */}
                  {bookingType === 'km' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div
                        onClick={() => setSelectedTier('limit120')}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedTier === 'limit120'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">120 Kms/Day</div>
                        <div className="font-bold text-gray-800">
                          ₹{currentVehicle.rentalOptions?.daily?.limit120?.price || '-'}
                        </div>
                      </div>
                      <div
                        onClick={() => setSelectedTier('limit300')}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedTier === 'limit300'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-xs text-gray-500 mb-1">300 Kms/Day</div>
                        <div className="font-bold text-gray-800">
                          ₹{currentVehicle.rentalOptions?.daily?.limit300?.price || '-'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info for Day Wise */}
                  {bookingType === 'day' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                      <div className="text-xs text-blue-600 font-semibold mb-1">UNLIMITED KMS</div>
                      <div className="font-bold text-gray-800">
                        ₹{currentVehicle.rentalOptions?.daily?.unlimited?.price || '-'} <span className="text-sm font-normal text-gray-500">/day</span>
                      </div>
                    </div>
                  )}
                </div>

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
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.pickupDate ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.dropoffDate ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
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
                    <div className="relative">
                      <input
                        type="text"
                        name="pickupLocation"
                        value={bookingData.pickupLocation}
                        onChange={handleInputChange}
                        placeholder="Enter pickup location"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.pickupLocation
                          ? 'border-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                      <FaMapMarkerAlt
                        className="absolute left-3 top-3.5 text-gray-400 cursor-pointer hover:text-blue-500 z-10"
                        onClick={() => openMap('pickup')}
                      />
                    </div>
                    {errors.pickupLocation && (
                      <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dropoff Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="dropoffLocation"
                        value={bookingData.dropoffLocation}
                        onChange={handleInputChange}
                        placeholder="Enter dropoff location"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.dropoffLocation
                          ? 'border-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                          }`}
                      />
                      <FaMapMarkerAlt
                        className="absolute left-3 top-3.5 text-gray-400 cursor-pointer hover:text-blue-500 z-10"
                        onClick={() => openMap('dropoff')}
                      />
                    </div>
                    {errors.dropoffLocation && (
                      <p className="text-red-500 text-sm mt-1">{errors.dropoffLocation}</p>
                    )}
                  </div>

                  {/* Driver Option */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="driver-checkbox"
                          name="wantsDriver"
                          type="checkbox"
                          checked={wantsDriver}
                          onChange={(e) => setWantsDriver(e.target.checked)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="driver-checkbox" className="font-medium text-gray-700">
                          I need a Driver (+ ₹500/day)
                        </label>
                        <p className="text-gray-500 text-xs mt-1">
                          Driver food and accommodation to be managed by customer for outstation trips.
                        </p>
                      </div>
                    </div>
                  </div>

                  {totalPrice > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Vehicle Base Price:</span>
                        <span className="font-semibold text-gray-800">
                          {/* Recalculating base for display */}
                          ₹{(() => {
                            if (!bookingData.pickupDate || !bookingData.dropoffDate) return 0;
                            const p = new Date(bookingData.pickupDate);
                            const d = new Date(bookingData.dropoffDate);
                            const days = Math.ceil(Math.abs(d - p) / (1000 * 60 * 60 * 24)) || 1;
                            return totalPrice - (wantsDriver ? 500 * days : 0);
                          })()}
                        </span>
                      </div>
                      {wantsDriver && (
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                          <span>Driver Fee:</span>
                          <span>+ ₹{(() => {
                            if (!bookingData.pickupDate || !bookingData.dropoffDate) return 0;
                            const p = new Date(bookingData.pickupDate);
                            const d = new Date(bookingData.dropoffDate);
                            const days = Math.ceil(Math.abs(d - p) / (1000 * 60 * 60 * 24)) || 1;
                            return 500 * days;
                          })()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                        <span className="font-bold text-gray-800">Total Price:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{totalPrice}</span>
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
        </div >
      </div >

      {showMap && (
        <LocationPicker
          onClose={() => setShowMap(false)}
          onConfirm={handleLocationSelect}
        />
      )}
    </div >
  );
};

export default VehicleDetail;

