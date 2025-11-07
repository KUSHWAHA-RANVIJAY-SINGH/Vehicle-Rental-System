import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import VehicleCard from '../components/VehicleCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import { dummyCarData, dummyBikeData } from '../assets/assets';

const Vehicles = () => {
  const dispatch = useDispatch();
  const { vehicles, loading } = useSelector((state) => state.vehicles);
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  useEffect(() => {
    dispatch(fetchVehicles(filters));
  }, [dispatch, filters]);

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Determine whether any filters are active
  const filtersActive = Boolean(
    filters.type || filters.brand || filters.minPrice || filters.maxPrice || filters.search
  );

  // Normalize dummy data items to match API shape (images array, `available` field)
  const normalizeDummy = (v) => ({
    _id: v._id || `${v.brand || v.name}-${v.model || ''}`,
    name: v.name || `${v.brand || ''} ${v.model || ''}`.trim(),
    brand: v.brand || '',
    model: v.model || '',
    year: v.year || '',
    pricePerDay: v.pricePerDay || 0,
    location: v.location || '',
    type: (v.type && v.type.toLowerCase()) || (v.seating_capacity && v.seating_capacity > 2 ? 'car' : 'bike'),
    images: Array.isArray(v.images) && v.images.length > 0 ? v.images : (v.image ? [v.image] : []),
    available: typeof v.available === 'boolean' ? v.available : (typeof v.isAvaliable === 'boolean' ? v.isAvaliable : true),
  });

  // Decide which list to render: API vehicles when present, otherwise
  // local dummy data only when no filters are active.
  const displayedVehicles = (vehicles && vehicles.length > 0)
    ? vehicles
    : (filtersActive ? [] : [...dummyCarData, ...dummyBikeData].map(normalizeDummy));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Available Vehicles</h1>

        <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} filters={filters} />

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVehicles.map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>

            {displayedVehicles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No vehicles found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Vehicles;

