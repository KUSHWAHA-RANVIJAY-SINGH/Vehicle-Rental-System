import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaCar, FaPlusCircle, FaCalendarAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Layout = () => {
         const navigate = useNavigate();
         const location = useLocation();
         const user = JSON.parse(localStorage.getItem('user') || '{}');
         const [sidebarOpen, setSidebarOpen] = React.useState(false);

         const handleLogout = () => {
                  localStorage.clear();
                  navigate('/login');
         };

         const menuItems = [
                  { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
                  { name: 'My Vehicles', path: '/vehicles', icon: <FaCar /> },
                  { name: 'Add Vehicle', path: '/add-vehicle', icon: <FaPlusCircle /> },
                  { name: 'Bookings', path: '/bookings', icon: <FaCalendarAlt /> },
                  { name: 'Profile', path: '/profile', icon: <FaUser /> },
         ];

         return (
                  <div className="flex h-screen bg-gray-100">
                           {/* Mobile Header */}
                           <div className="md:hidden fixed top-0 w-full bg-white shadow-sm z-20 flex justify-between items-center p-4">
                                    <h1 className="text-xl font-bold text-blue-600">Partner Portal</h1>
                                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 focus:outline-none">
                                             {/* Hamburger Icon */}
                                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                             </svg>
                                    </button>
                           </div>

                           {/* Sidebar Overlay for Mobile */}
                           {sidebarOpen && (
                                    <div
                                             className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                                             onClick={() => setSidebarOpen(false)}
                                    ></div>
                           )}

                           {/* Sidebar */}
                           <div className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                    <div className="p-6 border-b hidden md:block">
                                             <h1 className="text-2xl font-bold text-blue-600">Partner Portal</h1>
                                             <p className="text-sm text-gray-500">Welcome, {user.username || 'Partner'}</p>
                                    </div>

                                    {/* Mobile User Info in Sidebar */}
                                    <div className="p-6 border-b md:hidden bg-blue-50">
                                             <p className="font-semibold text-blue-800">Welcome, {user.username || 'Partner'}</p>
                                    </div>

                                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                             {menuItems.map((item) => (
                                                      <Link
                                                               key={item.path}
                                                               to={item.path}
                                                               onClick={() => setSidebarOpen(false)}
                                                               className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                                                        }`}
                                                      >
                                                               <span className="text-xl">{item.icon}</span>
                                                               <span>{item.name}</span>
                                                      </Link>
                                             ))}
                                    </nav>

                                    <div className="p-4 border-t">
                                             <button
                                                      onClick={handleLogout}
                                                      className="flex items-center space-x-3 text-gray-600 hover:text-red-600 w-full px-4 py-2 transition-colors"
                                             >
                                                      <FaSignOutAlt />
                                                      <span>Logout</span>
                                             </button>
                                    </div>
                           </div>

                           {/* Main Content */}
                           <div className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full">
                                    <Outlet />
                           </div>
                  </div>
         );
};

export default Layout;
