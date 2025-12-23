import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/slices/vehicleSlice';
import VehicleCard from '../components/VehicleCard';
import PricingTable from '../components/PricingTable';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import { FaThLarge, FaList, FaCarSide, FaMotorcycle } from 'react-icons/fa';
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
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  useEffect(() => {
    dispatch(fetchVehicles(filters));
  }, [dispatch, filters]);

  // Reset sub-category when main filters change (e.g. switching from Car to Bike)
  useEffect(() => {
    setSelectedSubCategory('');
  }, [filters]);

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
    // Map 'category' from dummy data to 'subCategory' if subCategory is missing
    subCategory: v.subCategory || v.category || 'Standard',
    images: Array.isArray(v.images) && v.images.length > 0 ? v.images : (v.image ? [v.image] : []),
    available: typeof v.available === 'boolean' ? v.available : (typeof v.isAvaliable === 'boolean' ? v.isAvaliable : true),
  });

  // 1. Get Base Vehicles (API or Dummy)
  const rawVehicles = (vehicles && vehicles.length > 0)
    ? vehicles
    : (filtersActive ? [] : [...dummyCarData, ...dummyBikeData].map(normalizeDummy));

  const subCategories = [...new Set(rawVehicles.map(v => v.subCategory || v.category).filter(Boolean))].sort();

  // 3. Filter by Selected Sub-Category
  const displayedVehicles = selectedSubCategory
    ? rawVehicles.filter(v => (v.subCategory || v.category) === selectedSubCategory)
    : rawVehicles;

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Our <span className="text-blue-600">Premium</span> Fleet
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Choose from our exclusive collection of luxury cars and high-performance bikes.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full shadow-lg border border-slate-100 inline-flex space-x-1">
            <button
              onClick={() => handleFilterChange('type', '')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${!filters.type
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              All Vehicles
            </button>
            <button
              onClick={() => handleFilterChange('type', 'bike')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center ${filters.type === 'bike'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <FaMotorcycle className="mr-2" /> Two Wheelers
            </button>
            <button
              onClick={() => handleFilterChange('type', 'car')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center ${filters.type === 'car'
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <FaCarSide className="mr-2" /> Four Wheelers
            </button>
          </div>
        </div>

        <div className="mb-10">
          <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} filters={filters} />
        </div>

        {/* Sub-Category Pills & View Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setSelectedSubCategory('')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all border ${!selectedSubCategory
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
            >
              All
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all border ${selectedSubCategory === sub
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex items-center shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                ? 'bg-slate-100 text-blue-600'
                : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Grid View"
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table'
                ? 'bg-slate-100 text-blue-600'
                : 'text-slate-400 hover:text-slate-600'
                }`}
              title="Pricing Table View"
            >
              <FaList />
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <PricingTable vehicles={displayedVehicles} />
              </div>
            )}

            {displayedVehicles.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                <FaCarSide className="mx-auto text-6xl text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No vehicles found</h3>
                <p className="text-slate-500">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Vehicles;

