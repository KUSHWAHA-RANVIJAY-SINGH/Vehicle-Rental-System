import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBookings, updateBookingStatus } from '../store/slices/bookingSlice';
import { fetchVehicles, deleteVehicle } from '../store/slices/vehicleSlice';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import VehicleForm from '../components/VehicleForm';
import {
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle,
  FaCar, FaMoneyBillWave, FaCalendarCheck, FaClock,
  FaChartLine, FaList, FaBars, FaEnvelope, FaUsers, FaFilter
} from 'react-icons/fa';
import { getVehicleImageUrl, DEFAULT_CAR_IMAGE, DEFAULT_BIKE_IMAGE } from '../utils/imageUtils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Admin = () => {
  const dispatch = useDispatch();
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const { vehicles, loading: vehiclesLoading } = useSelector((state) => state.vehicles);

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // '7days', 'month', 'all'

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchVehicles({}));
    dispatch(fetchAllBookings());
    fetchContacts();
    fetchPartners();

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  const fetchPartners = async () => {
    try {
      setPartnersLoading(true);
      const { data } = await api.get('/auth/partners');
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  const handlePartnerVerification = async (id, isVerified) => {
    try {
      await api.put(`/auth/partners/${id}/verify`, { isVerified });
      fetchPartners(); // Refresh list
    } catch (error) {
      console.error('Error updating partner status:', error);
      alert('Failed to update status');
    }
  };

  const handleVehicleApproval = async (id, status) => {
    try {
      await api.put(`/vehicles/${id}`, { status });
      dispatch(fetchVehicles({}));
      alert(`Vehicle ${status}`);
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      alert('Failed to update vehicle status');
    }
  };

  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const { data } = await api.get('/contact');
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    (b.vehicle?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartners = partners.filter(p =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Date Filtering Logic
  const getFilteredBookings = () => {
    const now = new Date();
    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      return bookings.filter(b => new Date(b.createdAt) >= sevenDaysAgo);
    } else if (dateFilter === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return bookings.filter(b => new Date(b.createdAt) >= firstDayOfMonth);
    }
    return bookings;
  };

  const filteredStatsBookings = getFilteredBookings();

  // Metrics Calculation based on Filtered Data
  const totalRevenue = filteredStatsBookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeBookings = filteredStatsBookings.filter((b) => b.status === 'confirmed').length;
  const pendingBookings = filteredStatsBookings.filter((b) => b.status === 'pending').length;
  const completedBookings = filteredStatsBookings.filter((b) => b.status === 'completed').length;
  const cancelledBookings = filteredStatsBookings.filter((b) => b.status === 'cancelled').length;

  const pendingVehicles = vehicles.filter((v) => v.status === 'Pending').length;

  // Chart Data Preparation
  const chartData = filteredStatsBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((acc, curr) => {
      const date = new Date(curr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.amount += curr.totalPrice;
      } else {
        acc.push({ date, amount: curr.totalPrice });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort mostly works, but for reliable sorting we might need timestamp. using Date parse works enough for recent.

  // If filtered by all time, maybe aggregate by month? For now, day-wise is fine for recent.
  // For 'all' time with lots of data, it might get crowded, but let's stick to simple day-wise for now.

  const pieData = [
    { name: 'Confirmed', value: activeBookings, color: '#10B981' }, // green-500
    { name: 'Pending', value: pendingBookings, color: '#F59E0B' }, // yellow-500
    { name: 'Completed', value: completedBookings, color: '#3B82F6' }, // blue-500
    { name: 'Cancelled', value: cancelledBookings, color: '#EF4444' }, // red-500
  ].filter(d => d.value > 0);

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
          <SidebarItem id="partners" icon={FaUsers} label="Partners" />
          <SidebarItem id="messages" icon={FaEnvelope} label="Messages" />
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="7days">Last 7 Days</option>
                  </select>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={`₹${totalRevenue.toLocaleString()}`}
                  icon={FaMoneyBillWave}
                  color="bg-green-500"
                  subtext="Gross Revenue Service fees"
                />
                <StatCard
                  title="Net Commission"
                  value={`₹${Math.round(totalRevenue * 0.1).toLocaleString()}`}
                  icon={FaChartLine}
                  color="bg-teal-500"
                  subtext="10% Platform Fee"
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
                <StatCard
                  title="Pending Vehicles"
                  value={pendingVehicles}
                  icon={FaCar}
                  color="bg-orange-500"
                  subtext="Waiting for approval"
                />
              </div>

              {/* Charts & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          formatter={(value) => [`₹${value}`, 'Revenue']}
                        />
                        <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Booking Status Distribution (Donut Chart) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status</h3>
                  <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-800">{filteredStatsBookings.length}</span>
                        <p className="text-xs text-gray-500 uppercase">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.user?.username}</div>
                            <div className="text-xs text-gray-500">{booking.user?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{booking.vehicle?.name}</div>
                            <div className="text-xs text-gray-500">{booking.vehicle?.brand}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ₹{booking.totalPrice?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    return (
                      <div key={vehicle._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <div className="h-48 overflow-hidden relative">
                          <img
                            src={getVehicleImageUrl(vehicle)}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const fallback = vehicle.type === 'bike' ? DEFAULT_BIKE_IMAGE : DEFAULT_CAR_IMAGE;
                              if (e.target.src !== fallback) {
                                e.target.src = fallback;
                              }
                            }}
                          />
                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                            <div className="bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                              ₹{vehicle.pricePerDay}/day
                            </div>
                            {vehicle.status === 'Pending' && (
                              <div className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm animate-pulse">
                                Pending Approval
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{vehicle.name}</h3>
                          <p className="text-sm text-gray-500 mb-4">{vehicle.brand} {vehicle.model}</p>

                          {vehicle.status === 'Pending' && (
                            <div className="mb-4 flex gap-2">
                              <button
                                onClick={() => handleVehicleApproval(vehicle._id, 'Approved')}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVehicleApproval(vehicle._id, 'Rejected')}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
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
                              <span className="text-sm font-mono font-bold text-gray-700">{booking.bookingId || 'N/A'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.vehicle?.name || 'Unknown Vehicle'}</div>
                              <div className="text-sm text-gray-500">{booking.vehicle?.brand || '-'}</div>
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
                              {booking.withDriver && (
                                <div className="text-xs text-blue-600 font-normal flex items-center mt-1">
                                  <span className="bg-blue-100 px-2 py-0.5 rounded-full flex items-center">
                                    + Driver
                                  </span>
                                </div>
                              )}
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

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {contactsLoading ? (
                <Loader />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredContacts.map((contact) => (
                          <tr key={contact._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(contact.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {contact.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {contact.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <p className="line-clamp-2">{contact.message}</p>
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

          {activeTab === 'partners' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Partner Verification</h2>
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {partnersLoading ? (
                <Loader />
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPartners.map((partner) => (
                          <tr key={partner._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {partner.username.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{partner.username}</div>
                                  <div className="text-sm text-gray-500">{partner.email}</div>
                                  <div className="text-xs text-gray-400">{partner.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {partner.partnerDetails ? (
                                <div className="text-sm text-gray-500">
                                  <div>Acct: {partner.partnerDetails.bankAccount || 'N/A'}</div>
                                  <div>IFSC: {partner.partnerDetails.ifsc || 'N/A'}</div>
                                  <div>PAN: {partner.partnerDetails.panCard || 'N/A'}</div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">No Details</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${partner.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {partner.isVerified ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {!partner.isVerified ? (
                                <button
                                  onClick={() => handlePartnerVerification(partner._id, true)}
                                  className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-xs mr-2 transition"
                                >
                                  Approve
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePartnerVerification(partner._id, false)}
                                  className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-xs transition"
                                >
                                  Revoke
                                </button>
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
      </div >

      {/* Vehicle Form Modal */}
      < Modal
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
      </Modal >
    </div >
  );
};

export default Admin;

