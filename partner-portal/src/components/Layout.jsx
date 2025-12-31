import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaCar, FaPlusCircle, FaCalendarAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Layout = () => {
         const navigate = useNavigate();
         const location = useLocation();
         const user = JSON.parse(localStorage.getItem('user') || '{}');

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
                           {/* Sidebar */}
                           <div className="w-64 bg-white shadow-lg flex flex-col">
                                    <div className="p-6 border-b">
                                             <h1 className="text-2xl font-bold text-blue-600">Partner Portal</h1>
                                             <p className="text-sm text-gray-500">Welcome, {user.username || 'Partner'}</p>
                                    </div>

                                    <nav className="flex-1 p-4 space-y-2">
                                             {menuItems.map((item) => (
                                                      <Link
                                                               key={item.path}
                                                               to={item.path}
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
                           <div className="flex-1 overflow-auto p-8">
                                    <Outlet />
                           </div>
                  </div>
         );
};

export default Layout;
