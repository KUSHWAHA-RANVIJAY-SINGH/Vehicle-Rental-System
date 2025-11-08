import { Link } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

const VehicleCard = ({ vehicle }) => {
  // Default placeholder images based on vehicle type
  const defaultCarImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
  const defaultBikeImage = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';

  // Get image URL with proper fallback
  const getImageUrl = () => {
    if (vehicle.images && vehicle.images.length > 0 && vehicle.images[0]) {
      const url = vehicle.images[0];
      // Check if it's a valid URL (starts with http:// or https://)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
    }
    return vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/vehicles/${vehicle._id}`}>
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={imageUrl}
            alt={vehicle.name || 'Vehicle'}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Prevent infinite loop by checking if already using fallback
              if (e.target.src !== defaultCarImage && e.target.src !== defaultBikeImage) {
                e.target.src = vehicle.type === 'car' ? defaultCarImage : defaultBikeImage;
              }
            }}
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded">
            <span className="text-sm font-semibold text-blue-600">
              ₹{vehicle.pricePerDay}/day
            </span>
          </div>
          <div className="absolute top-2 left-2">
            {vehicle.type === 'car' ? (
              <FaCar className="text-white text-2xl drop-shadow-lg" />
            ) : (
              <FaMotorcycle className="text-white text-2xl drop-shadow-lg" />
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/vehicles/${vehicle._id}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition">
            {vehicle.name}
          </h3>
        </Link>
        <p className="text-gray-600 mb-2">
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </p>
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <FaMapMarkerAlt className="mr-1" />
          <span>{vehicle.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${vehicle.available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}
          >
            {vehicle.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;

