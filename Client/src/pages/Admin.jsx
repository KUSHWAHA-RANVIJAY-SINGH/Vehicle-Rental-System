import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBookings, updateBookingStatus } from '../store/slices/bookingSlice';
import { fetchVehicles, deleteVehicle } from '../store/slices/vehicleSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import VehicleForm from '../components/VehicleForm';
import {
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle,
  FaCar, FaMoneyBillWave, FaCalendarCheck, FaClock,
  FaChartLine, FaList, FaBars
} from 'react-icons/fa';

const Admin = () => {
  const dispatch = useDispatch();
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { vehicles, loading: vehiclesLoading } = useSelector((state) => state.vehicles);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchVehicles({}));
    dispatch(fetchAllBookings());
  }, [dispatch]);

  // Filter logic
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          <Icon className={`text-xl ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
  );

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${activeTab === id
        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <Icon className="text-lg" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white shadow-xl fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <FaChartLine className="text-blue-600 mr-2" />
            Admin Portal
          </h1>
        </div>
        <nav className="mt-6">
          <SidebarItem id="overview" icon={FaChartLine} label="Overview" />
          <SidebarItem id="vehicles" icon={FaCar} label="Vehicles" />
          <SidebarItem id="bookings" icon={FaList} label="Bookings" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaBars className="text-xl" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Welcome, Admin</span>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={`₹${totalRevenue.toLocaleString()}`}
                  icon={FaMoneyBillWave}
                  color="bg-green-500"
                  subtext="+12% from last month"
                />
                <StatCard
                  title="Total Vehicles"
                  value={vehicles.length}
                  icon={FaCar}
                  color="bg-blue-500"
                  subtext={`${vehicles.filter(v => v.available).length} available now`}
                />
                <StatCard
                  title="Active Bookings"
                  value={activeBookings}
                  icon={FaCalendarCheck}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Pending Requests"
                  value={pendingBookings}
                  icon={FaClock}
                  color="bg-yellow-500"
                  subtext="Requires attention"
                />
              </div>

              {/* Recent Activity / Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Confirmed</span>
                        <span className="font-medium">{activeBookings}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(activeBookings / (bookings.length || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-medium">{pendingBookings}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(pendingBookings / (bookings.length || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-medium">{completedBookings}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(completedBookings / (bookings.length || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Vehicle Management</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      setEditingVehicle(null);
                      setShowVehicleModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center shadow-sm"
                  >
                    <FaPlus className="mr-2" />
                    Add Vehicle
                  </button>
                </div>
              </div>

              {vehiclesLoading ? (
                <Loader />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle) => {
                    const defaultCarImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
                    const defaultBikeImage = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';

                    const getImageUrl = () => {
                      if (vehicle.images && vehicle.images.length > 0 && vehicle.images[0]) {
                        const url = vehicle.images[0];
                        if (url.startsWith('http://') || url.startsWith('https://')) return url;
                      }
                      return vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                    };

                    return (
                      <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={getImageUrl()}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
                                e.target.src = vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
                              }
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                            ₹{vehicle.pricePerDay}/day
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{vehicle.name}</h3>
                          <p className="text-sm text-gray-500 mb-4">{vehicle.brand} {vehicle.model}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingVehicle(vehicle);
                                setShowVehicleModal(true);
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center text-sm font-medium"
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center text-sm font-medium"
                            >
                              <FaTrash className="mr-2" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {bookingsLoading ? (
                <Loader />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.vehicle.name}</div>
                              <div className="text-sm text-gray-500">{booking.vehicle.brand}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.user?.username}</div>
                              <div className="text-sm text-gray-500">{booking.user?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(booking.pickupDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                to {new Date(booking.dropoffDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{booking.totalPrice}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {booking.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleStatusChange(booking._id, 'confirmed')}
                                    className="text-green-600 hover:text-green-900"
                                    title="Approve"
                                  >
                                    <FaCheckCircle className="text-xl" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(booking._id, 'cancelled')}
                                    className="text-red-600 hover:text-red-900"
                                    title="Reject"
                                  >
                                    <FaTimesCircle className="text-xl" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

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
  );
};

export default Admin;

