import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBookings, updateBookingStatus } from '../store/slices/bookingSlice';
import { fetchVehicles, deleteVehicle } from '../store/slices/vehicleSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import VehicleForm from '../components/VehicleForm';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const Admin = () => {
  const dispatch = useDispatch();
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { vehicles, loading: vehiclesLoading } = useSelector((state) => state.vehicles);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('vehicles');

  useEffect(() => {
    dispatch(fetchVehicles({}));
    dispatch(fetchAllBookings());
  }, [dispatch]);

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await dispatch(deleteVehicle(id));
      dispatch(fetchVehicles({}));
    }
  };

  const handleStatusChange = async (bookingId, status) => {
    await dispatch(updateBookingStatus({ id: bookingId, status }));
    dispatch(fetchAllBookings());
  };

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-2">Total Vehicles</h3>
            <p className="text-3xl font-bold text-blue-600">{vehicles.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-2">Active Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">{activeBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 mb-2">Pending Bookings</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`py-4 px-6 font-medium ${activeTab === 'vehicles'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Vehicles
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 px-6 font-medium ${activeTab === 'bookings'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Manage Vehicles</h2>
              <button
                onClick={() => {
                  setEditingVehicle(null);
                  setShowVehicleModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Vehicle
              </button>
            </div>

            {vehiclesLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => {
                  const defaultCarImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
                  const defaultBikeImage = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';

                  // Get image URL with proper fallback
                  const getImageUrl = () => {
                    if (vehicle.images && vehicle.images.length > 0 && vehicle.images[0]) {
                      const url = vehicle.images[0];
                      // Check if it's a valid URL (starts with http:// or https://)
                      if (url.startsWith('http://') || url.startsWith('https://')) {
                        return url;
                      }
                    }
                    return vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                  };

                  const imageUrl = getImageUrl();

                  return (
                    <div key={vehicle._id} className="bg-white rounded-lg shadow-md p-4">
                      <img
                        src={imageUrl}
                        alt={vehicle.name || 'Vehicle'}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          // Prevent infinite loop by checking if already using fallback
                          if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
                            e.target.src = vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                          }
                        }}
                        loading="lazy"
                      />
                      <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
                      <p className="text-gray-600 mb-2">
                        {vehicle.brand} {vehicle.model} - ₹{vehicle.pricePerDay}/day
                      </p>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => {
                            setEditingVehicle(vehicle);
                            setShowVehicleModal(true);
                          }}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
                        >
                          <FaEdit className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle._id)}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition flex items-center justify-center"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Bookings</h2>
            {bookingsLoading ? (
              <Loader />
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{booking.vehicle.name}</h3>
                        <p className="text-gray-600">
                          {booking.vehicle.brand} {booking.vehicle.model}
                        </p>
                        <p className="text-sm text-gray-500">User: {booking.user?.username}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-4 md:mt-0">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                          {booking.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600">
                          Dates: {new Date(booking.pickupDate).toLocaleDateString()} -{' '}
                          {new Date(booking.dropoffDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">Total: ₹{booking.totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pickup: {booking.pickupLocation}</p>
                        <p className="text-gray-600">Dropoff: {booking.dropoffLocation}</p>
                      </div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusChange(booking._id, 'confirmed')}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center"
                        >
                          <FaCheckCircle className="mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking._id, 'cancelled')}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center"
                        >
                          <FaTimesCircle className="mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vehicle Form Modal */}
        <Modal
          isOpen={showVehicleModal}
          onClose={() => {
            setShowVehicleModal(false);
            setEditingVehicle(null);
          }}
          title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        >
          <VehicleForm
            vehicle={editingVehicle}
            onSuccess={() => {
              setShowVehicleModal(false);
              setEditingVehicle(null);
              dispatch(fetchVehicles({}));
            }}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Admin;

