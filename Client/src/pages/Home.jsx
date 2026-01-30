import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import VehicleCard from '../components/VehicleCard';
import RecommendedVehicles from '../components/RecommendedVehicles';
import Loader from '../components/Loader';
import HeroSlider from '../components/HeroSlider';
import { FaShieldAlt, FaClock, FaStar, FaSearch, FaUserCheck, FaCreditCard, FaKey } from 'react-icons/fa';

const Home = () => {
  const dispatch = useDispatch();
  const { vehicles, loading } = useSelector((state) => state.vehicles);

  useEffect(() => {
    dispatch(fetchVehicles({ available: 'true' }));
  }, [dispatch]);

  const featuredVehicles = vehicles.slice(0, 6);

  const steps = [
    { icon: <FaSearch />, title: "Choose Vehicle", desc: "Browse our premium fleet and pick your favorite." },
    { icon: <FaUserCheck />, title: "Book Online", desc: "Select dates and providing your details securely." },
    { icon: <FaKey />, title: "Pick & Drive", desc: "Pick up your car or bike and enjoy the ride." },
  ];

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <HeroSlider />

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-0 transform -translate-y-1/2 w-2/3 mx-auto"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative z-10 bg-white p-8 rounded-xl shadow-lg text-center hover:-translate-y-2 transition duration-300">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-blue-200 shadow-xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Why Choose <span className="text-blue-600">RentWheels?</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We don't just rent vehicles; we provide experiences. Our commitment to quality and safety ensures that every mile you drive is worry-free.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="text-blue-600 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">100% Secure</h4>
                    <p className="text-gray-600 text-sm mt-1">Safe payments & verified cars.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaClock className="text-blue-600 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">24/7 Support</h4>
                    <p className="text-gray-600 text-sm mt-1">We're here whenever you need us.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaStar className="text-blue-600 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Top Rated</h4>
                    <p className="text-gray-600 text-sm mt-1">Loved by thousands of travelers.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaCreditCard className="text-blue-600 text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Affordable</h4>
                    <p className="text-gray-600 text-sm mt-1">Best prices in the market.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 opacity-10"></div>
              <img
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80"
                alt="Luxury Car"
                className="relative rounded-3xl shadow-2xl w-full object-cover h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Vehicles</h2>
              <p className="mt-2 text-gray-600">Top picks for your next adventure</p>
            </div>
            <Link to="/vehicles" className="hidden md:inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 transition">
              View All <span className="ml-2">&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles.map((vehicle) => (
                <div key={vehicle._id} className="transform transition duration-300 hover:scale-[1.02]">
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          )}

          {!loading && featuredVehicles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600 text-lg">No vehicles available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
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
      <section className="py-24 bg-gradient-to-r from-blue-700 to-blue-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <circle cx="0" cy="0" r="40" fill="white" />
            <circle cx="100" cy="100" r="30" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to hit the road?</h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light">
            Book your dream car today and get 15% off your first rental!
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-800 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-2xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

