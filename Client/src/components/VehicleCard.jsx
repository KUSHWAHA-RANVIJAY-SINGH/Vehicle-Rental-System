import { Link } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaMapMarkerAlt, FaStar, FaGasPump, FaCogs } from 'react-icons/fa';

const VehicleCard = ({ vehicle }) => {
  // Default placeholder images based on vehicle type
  const defaultCarImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
  const defaultBikeImage = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';

  // Get image URL with proper fallback
  const getImageUrl = () => {
    if (vehicle.images && vehicle.images.length > 0 && vehicle.images[0]) {
      const url = vehicle.images[0];
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
    }
    return vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
  };

  const imageUrl = getImageUrl();
  const isAvailable = vehicle.available;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      <Link to={`/vehicles/${vehicle._id}`} className="relative block h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={vehicle.name || 'Vehicle'}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 will-change-transform"
          onError={(e) => {
            if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
              e.target.src = vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
            }
          }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Type Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
          {vehicle.type === 'car' ? (
            <FaCar className="text-blue-600 text-lg" />
          ) : (
            <FaMotorcycle className="text-orange-600 text-lg" />
          )}
        </div>

        {/* Availability Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
          {isAvailable ? 'Available' : 'Booked'}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg border border-gray-100">
          <div className="text-right">
            <span className="text-xs text-gray-400 font-semibold uppercase">Daily Rate</span>
            <p className="font-bold text-gray-900 text-lg leading-none">
              ₹{vehicle.pricePerDay}
            </p>
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/vehicles/${vehicle._id}`} className="block">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {vehicle.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm font-medium mb-4">
          {vehicle.brand} {vehicle.model} • {vehicle.year}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
            <FaGasPump className="mr-2 text-blue-400" />
            <span>Default Fuel</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
            <FaCogs className="mr-2 text-blue-400" />
            <span>Automatic</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-600 text-sm">
            <FaMapMarkerAlt className="mr-1 text-red-400" />
            <span className="line-clamp-1 max-w-[120px]">{vehicle.location}</span>
          </div>
          <div className="flex items-center font-bold text-gray-800">
            <FaStar className="text-yellow-400 mr-1" />
            <span>4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;

