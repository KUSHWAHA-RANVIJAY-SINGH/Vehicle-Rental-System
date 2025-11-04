import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FaUser, FaSignOutAlt, FaCar, FaTachometerAlt } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaCar className="text-blue-600 text-2xl" />
            <span className="text-xl font-bold text-gray-800">RentWheels</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/vehicles" className="text-gray-700 hover:text-blue-600 transition">
              Vehicles
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition">
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
                >
                  <FaTachometerAlt />
                  <span>Dashboard</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600" />
                  <span className="text-gray-700">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/vehicles" className="block text-gray-700 hover:text-blue-600">Vehicles</Link>
            <Link to="/about" className="block text-gray-700 hover:text-blue-600">About</Link>
            <Link to="/contact" className="block text-gray-700 hover:text-blue-600">Contact</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block text-gray-700 hover:text-blue-600">Admin</Link>
                )}
                <div className="pt-2 border-t">
                  <div className="text-gray-700 mb-2">{user?.username}</div>
                  <button onClick={handleLogout} className="text-red-600 hover:text-red-700">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t space-y-2">
                <Link to="/login" className="block text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

