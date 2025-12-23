import { FaCar, FaShieldAlt, FaClock, FaStar, FaUsers, FaRupeeSign, FaHeart } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaStar className="text-4xl text-yellow-500 mb-4" />,
      title: "Premium Quality",
      description: "Our fleet consists of top-tier vehicles, rigorously maintained to ensure safety and comfort for every journey."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-blue-500 mb-4" />,
      title: "Secure & Safe",
      description: "Your safety is priority. 24/7 roadside assistance and comprehensive insurance coverage included."
    },
    {
      icon: <FaClock className="text-4xl text-green-500 mb-4" />,
      title: "24/7 Support",
      description: "Our dedicated support team is available around the clock to assist you with any queries or emergencies."
    },
    {
      icon: <FaRupeeSign className="text-4xl text-indigo-500 mb-4" />,
      title: "Best Pricing",
      description: "Transparent pricing with no hidden charges. Get the best value for your money with our competitive rates."
    }
  ];

  const stats = [
    { icon: <FaUsers />, value: "10k+", label: "Happy Customers" },
    { icon: <FaCar />, value: "500+", label: "Vehicles" },
    { icon: <FaStar />, value: "4.8", label: "Average Rating" },
    { icon: <FaShieldAlt />, value: "100%", label: "Secure Trips" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-blue-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Driving Your <span className="text-blue-400">Dreams</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
            RentWheels isn't just a car rental service; it's your gateway to exploring the world with freedom, comfort, and style.
          </p>
        </div>
      </section>

      {/* Our Story & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Refining the Way You <br /><span className="text-blue-600">Travel</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Founded in 2020, RentWheels started with a simple vision: to bridge the gap between accessibility and luxury. We noticed that renting a vehicle was often a tedious process filled with paperwork and uncertainty.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We set out to change that. By combining technology with a customer-first approach, we've created a seamless rental experience. Whether it's a weekend getaway or a daily commute, we provide the keys to your next adventure.
              </p>
              <div className="pt-4">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                  Read More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
              <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaHeart className="text-red-500 mr-2" /> Our Mission
                </h3>
                <p className="text-gray-600 italic text-lg">
                  "To empower every traveler with the freedom to move, providing reliable, safe, and affordable vehicles with a service that feels like family."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why RentWheels?</h2>
            <p className="mt-4 text-xl text-gray-600">Experience the difference with our premium services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-2xl transition duration-300 border border-gray-100 group">
                <div className="group-hover:scale-110 transition duration-300 transform origin-left">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl text-blue-300 flex justify-center mb-2">{stat.icon}</div>
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="text-blue-200 uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to start your journey?</h2>
          <p className="text-xl text-gray-600 mb-8">Book your perfect vehicle today and explore the world on your own terms.</p>
          <a href="/vehicles" className="inline-block bg-blue-600 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105">
            Browse Vehicles
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;

