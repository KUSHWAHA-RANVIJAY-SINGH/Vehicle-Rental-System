import { FaCar, FaShieldAlt, FaClock, FaStar, FaUsers, FaDollarSign } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">About RentWheels</h1>
          <p className="text-xl text-blue-100">
            Your trusted partner for car and bike rentals since 2020
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg mb-4">
                RentWheels was founded with a simple mission: to make vehicle rental accessible,
                affordable, and hassle-free for everyone. We understand that transportation is
                essential, and we're here to provide you with quality vehicles at competitive prices.
              </p>
              <p className="text-gray-600 text-lg">
                Over the years, we've built a reputation for reliability, excellent customer service,
                and a wide selection of well-maintained vehicles. Whether you need a car for a
                weekend trip or a bike for your daily commute, we've got you covered.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <FaStar className="text-blue-600 mr-3" />
                  <span className="text-gray-700">Premium quality vehicles</span>
                </li>
                <li className="flex items-center">
                  <FaShieldAlt className="text-blue-600 mr-3" />
                  <span className="text-gray-700">Secure and reliable service</span>
                </li>
                <li className="flex items-center">
                  <FaClock className="text-blue-600 mr-3" />
                  <span className="text-gray-700">24/7 customer support</span>
                </li>
                <li className="flex items-center">
                  <FaDollarSign className="text-blue-600 mr-3" />
                  <span className="text-gray-700">Competitive pricing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center bg-white rounded-lg shadow-md p-6">
              <FaUsers className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-2">10,000+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center bg-white rounded-lg shadow-md p-6">
              <FaCar className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-2">500+</h3>
              <p className="text-gray-600">Vehicles Available</p>
            </div>
            <div className="text-center bg-white rounded-lg shadow-md p-6">
              <FaStar className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-2">4.8</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="text-center bg-white rounded-lg shadow-md p-6">
              <FaShieldAlt className="text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-800 mb-2">100%</h3>
              <p className="text-gray-600">Secure Payments</p>
            </div>
          </div>

          {/* Mission */}
          <div className="bg-blue-600 text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              To provide convenient, affordable, and reliable vehicle rental services that empower
              our customers to travel freely and explore the world around them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

