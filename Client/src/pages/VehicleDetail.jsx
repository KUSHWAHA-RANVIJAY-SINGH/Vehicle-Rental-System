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
        // Use currentVehicle._id instead of URL param (which might be a slug)
        const { data: availability } = await api.get(`/vehicles/${currentVehicle._id}/availability?start=${encodeURIComponent(pickup.toISOString())}&end=${encodeURIComponent(dropoff.toISOString())}`);
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
          vehicle: currentVehicle._id, // Use resolved _id from state
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

        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column (66%) - Images & Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Main Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={imageUrl}
                alt={currentVehicle.name || 'Vehicle'}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
                    e.target.src = currentVehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                  }
                }}
              />
            </div>

            {/* 2. Image Gallery (3 placeholders) */}
            <div className="grid grid-cols-3 gap-4">
              {/* If we have real extra images, show them; otherwise show placeholders or repeat main image */}
              {currentVehicle.images && currentVehicle.images.length > 1
                ? currentVehicle.images.slice(1, 4).map((img, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden h-32">
                    <img
                      src={img}
                      alt={`Gallery ${idx}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                      onError={(e) => {
                        e.target.src = currentVehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                      }}
                    />
                  </div>
                ))
                : (
                  // Fallback placeholders if no extra images
                  [1, 2, 3].map((_, idx) => (
                    <div key={idx} className="bg-gray-200 rounded-lg shadow-sm h-32 flex items-center justify-center text-gray-400">
                      <span className="text-sm">Image {idx + 1}</span>
                    </div>
                  ))
                )
              }
            </div>

            {/* 3. Vehicle Details Card */}
            <div className="bg-white rounded-lg shadow-md p-6">

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentVehicle.name}</h1>
                  <p className="text-xl text-gray-600">
                    {currentVehicle.brand} {currentVehicle.model} ({currentVehicle.year})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{currentVehicle.pricePerDay}
                  </div>
                  <div className="text-gray-500 text-sm">/day</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {currentVehicle.type === 'car' ? <FaCar /> : <FaMotorcycle />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                      <p className="font-medium text-gray-800 capitalize">{currentVehicle.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                      <p className="font-medium text-gray-800">{currentVehicle.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                      {/* Icon for Fuel - using generic if needed or Calendar as placeholder */}
                      <span className="font-bold text-sm">⛽</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fuel</p>
                      <p className="font-medium text-gray-800">{currentVehicle.fuelType}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <span className="font-bold text-sm">⚙️</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Transmission</p>
                      <p className="font-medium text-gray-800">{currentVehicle.transmission}</p>
                    </div>
                  </div>

                  {currentVehicle.seats && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg text-red-600">
                        <span className="font-bold text-sm">💺</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Seats</p>
                        <p className="font-medium text-gray-800">{currentVehicle.seats} Persons</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <span className="font-bold text-sm">📅</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Year</p>
                      <p className="font-medium text-gray-800">{currentVehicle.year}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description & Features */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {currentVehicle.description || "No description available for this vehicle."}
                </p>

                {currentVehicle.features?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentVehicle.features.map((feature, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              {currentVehicle.documents?.length > 0 && (
                <div className="mb-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Required Documents</h3>
                  <ul className="flex gap-4">
                    {currentVehicle.documents.map((doc, idx) => (
                      <li key={idx}>
                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                          <span className="mr-1">📄</span> Document {idx + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Badge */}
              <div className="pt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentVehicle.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${currentVehicle.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {currentVehicle.available ? 'Available Now' : 'Currently Unavailable'}
                </span>
              </div>
            </div>

            {/* Recommendations Row */}
            {recommendations.length > 0 && (
              <div className="pt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map(rec => (
                    <a key={rec._id} href={`/vehicles/${rec._id}`} className="block group">
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={(rec.images && rec.images[0]) || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop'}
                            alt={rec.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-800 mb-1">{rec.name}</h4>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">{rec.brand}</span>
                            <span className="font-semibold text-blue-600">₹{rec.pricePerDay}/day</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (33%) - Sticky Booking Form */}
          <div className="lg:col-span-1 lg:sticky lg:top-4 self-start space-y-6">

            {currentVehicle.available ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <h2 className="text-xl font-bold text-gray-800 mb-6">Book This Vehicle</h2>

                {/* Pricing Toggles */}
                <div className="mb-6">
                  <div className="bg-gray-100 p-1 rounded-lg flex mb-4">
                    <button
                      type="button"
                      onClick={() => { setBookingType('day'); setSelectedTier('unlimited'); }}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${bookingType === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Daily (Unlimited)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBookingType('km'); setSelectedTier('limit120'); }}
                      className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${bookingType === 'km' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Kilometer Wise
                    </button>
                  </div>

                  {bookingType === 'km' && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedTier('limit120')}
                        className={`border rounded-lg p-3 text-left transition-all ${selectedTier === 'limit120' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="text-xs text-gray-500 mb-1">120 Km/Day</div>
                        <div className="font-bold text-gray-800">₹{currentVehicle.rentalOptions?.daily?.limit120?.price || '-'}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTier('limit300')}
                        className={`border rounded-lg p-3 text-left transition-all ${selectedTier === 'limit300' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="text-xs text-gray-500 mb-1">300 Km/Day</div>
                        <div className="font-bold text-gray-800">₹{currentVehicle.rentalOptions?.daily?.limit300?.price || '-'}</div>
                      </button>
                    </div>
                  )}

                  {bookingType === 'day' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Package</div>
                        <div className="text-sm font-medium text-gray-700">Unlimited Kilometers</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">₹{currentVehicle.rentalOptions?.daily?.unlimited?.price || '-'}</div>
                        <div className="text-xs text-gray-500">per day</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleBookNow} className="space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pickup Date</label>
                      <input
                        type="date"
                        name="pickupDate"
                        value={bookingData.pickupDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dropoff Date</label>
                      <input
                        type="date"
                        name="dropoffDate"
                        value={bookingData.dropoffDate}
                        onChange={handleInputChange}
                        min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dropoffDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>
                  {errors.pickupDate && <p className="text-red-500 text-xs">{errors.pickupDate}</p>}
                  {errors.dropoffDate && <p className="text-red-500 text-xs">{errors.dropoffDate}</p>}

                  {/* Locations */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pickup Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="pickupLocation"
                          value={bookingData.pickupLocation}
                          onChange={handleInputChange}
                          placeholder="City, Area, or Address"
                          className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pickupLocation ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FaMapMarkerAlt className="absolute left-3 top-2.5 text-gray-400" />
                        <button type="button" onClick={() => openMap('pickup')} className="absolute right-2 top-1.5 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Map</button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dropoff Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="dropoffLocation"
                          value={bookingData.dropoffLocation}
                          onChange={handleInputChange}
                          placeholder="City, Area, or Address"
                          className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dropoffLocation ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FaMapMarkerAlt className="absolute left-3 top-2.5 text-gray-400" />
                        <button type="button" onClick={() => openMap('dropoff')} className="absolute right-2 top-1.5 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600">Map</button>
                      </div>
                    </div>
                  </div>

                  {/* Driver Toggle */}
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="driver-toggle"
                          type="checkbox"
                          checked={wantsDriver}
                          onChange={(e) => setWantsDriver(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="driver-toggle" className="ml-2 text-sm font-medium text-gray-700 select-none">Need a Driver?</label>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">+₹500/day</span>
                    </div>
                    <span className="text-xs text-amber-600 italic mt-2 block">Note: Driver's food and accommodation are extra.</span>
                  </div>

                  {/* Price Summary */}
                  {totalPrice > 0 && (
                    <div className="bg-gray-900 rounded-lg p-4 text-white mt-4">
                      <div className="flex justify-between items-center text-sm opacity-80 mb-1">
                        <span>Estimated Total</span>
                        <span>{Math.ceil(Math.abs(new Date(bookingData.dropoffDate) - new Date(bookingData.pickupDate)) / (1000 * 60 * 60 * 24)) || 1} Days</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-2xl font-bold">₹{totalPrice}</span>
                        <span className="text-xs opacity-60 mb-1">Including all taxes</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    {isAuthenticated ? 'Proceed to Pay' : 'Login to Book'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Unavailable</h3>
                <p className="text-gray-600 text-sm">This vehicle is currently not available for booking. Please check back later or browse other vehicles.</p>
                <button onClick={() => navigate('/vehicles')} className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition">
                  Browse Other Vehicles
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {showMap && (
        <LocationPicker
          onClose={() => setShowMap(false)}
          onConfirm={handleLocationSelect}
        />
      )}
    </div>
  );
};

export default VehicleDetail;

