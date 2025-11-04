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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Find Your Perfect Ride</h1>
            <p className="text-xl mb-8 text-blue-100">
              Rent cars and bikes at affordable prices. Quality vehicles, trusted service.
            </p>
            <Link
              to="/vehicles"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition inline-block"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <FaCar className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Cars and bikes for every need</p>
            </div>
            <div className="text-center">
              <FaShieldAlt className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Secure Booking</h3>
              <p className="text-gray-600">Safe and reliable transactions</p>
            </div>
            <div className="text-center">
              <FaClock className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Always here to help you</p>
            </div>
            <div className="text-center">
              <FaStar className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive rental rates</p>
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

