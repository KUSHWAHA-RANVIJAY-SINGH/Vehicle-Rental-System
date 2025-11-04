import { Link } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaMapMarkerAlt, FaStar } from 'react-icons/fa';

const VehicleCard = ({ vehicle }) => {
  const imageUrl = vehicle.images?.[0] || '/placeholder-car.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/vehicles/${vehicle._id}`}>
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={vehicle.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Vehicle';
            }}
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded">
            <span className="text-sm font-semibold text-blue-600">
              ${vehicle.pricePerDay}/day
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
            className={`px-2 py-1 rounded text-xs font-semibold ${
              vehicle.available
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

