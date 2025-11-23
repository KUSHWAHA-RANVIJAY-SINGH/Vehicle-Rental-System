import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import VehicleCard from '../components/VehicleCard';
import Loader from '../components/Loader';
import { FaCar, FaMotorcycle, FaShieldAlt, FaClock, FaStar } from 'react-icons/fa';

const Home = () => {
  const dispatch = useDispatch();
  const { vehicles, loading } = useSelector((state) => state.vehicles);

  useEffect(() => {
    dispatch(fetchVehicles({ available: 'true' }));
  }, [dispatch]);

  const featuredVehicles = vehicles.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-32">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Find Your <span className="text-blue-400">Perfect Ride</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto">
              Rent premium cars and bikes at affordable prices. Experience the freedom of the road with our trusted service.
            </p>
            <Link
              to="/vehicles"
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-4 text-gray-600">We provide the best experience for our customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition duration-300">
                <FaCar className="text-2xl text-blue-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Wide Selection</h3>
              <p className="text-gray-600">Choose from our extensive fleet of premium cars and bikes.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition duration-300">
                <FaShieldAlt className="text-2xl text-blue-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Booking</h3>
              <p className="text-gray-600">Your safety and security are our top priorities.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition duration-300">
                <FaClock className="text-2xl text-blue-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">24/7 Support</h3>
              <p className="text-gray-600">Our dedicated team is always here to assist you.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 transition duration-300">
                <FaStar className="text-2xl text-blue-600 group-hover:text-white transition duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Best Prices</h3>
              <p className="text-gray-600">Enjoy competitive rates without compromising on quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Vehicles</h2>
            <p className="text-gray-600">Popular choices for your next adventure</p>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}

          {!loading && featuredVehicles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No vehicles available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/vehicles"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
            >
              View All Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust us for their transportation needs.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

