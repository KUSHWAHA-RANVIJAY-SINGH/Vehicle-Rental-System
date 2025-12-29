import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

import useDebounce from '../hooks/useDebounce';

const SearchBar = ({ onSearch, onFilterChange, filters }) => {
  // Local inputs so we can debounce before notifying parent
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [localFilters, setLocalFilters] = useState({
    brand: filters.brand || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || ''
  });

  // Keep local copy in sync when parent filters change (e.g., reset from elsewhere)
  useEffect(() => {
    setLocalFilters({
      brand: filters.brand || '',
      minPrice: filters.minPrice || '',
      maxPrice: filters.maxPrice || ''
    });
    // Also keep search input in sync if parent clears it
    if (!filters.search) setSearchInput('');
  }, [filters]);

  // Debounced values
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedBrand = useDebounce(localFilters.brand, 500);
  const debouncedMinPrice = useDebounce(localFilters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(localFilters.maxPrice, 500);

  // Notify parent only after user stops typing for 500ms
  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    onFilterChange('brand', debouncedBrand);
  }, [debouncedBrand]);

  useEffect(() => {
    onFilterChange('minPrice', debouncedMinPrice);
  }, [debouncedMinPrice]);

  useEffect(() => {
    onFilterChange('maxPrice', debouncedMaxPrice);
  }, [debouncedMaxPrice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit immediately if user clicks Search button
    onSearch(searchInput);
  };

  const clearFilters = () => {
    setSearchInput('');
    setLocalFilters({ brand: '', minPrice: '', maxPrice: '' });
    // Immediately clear parent filters and search
    onSearch('');
    onFilterChange('type', '');
    onFilterChange('brand', '');
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', '');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by name, brand, or model..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-gray-50 focus:bg-white"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center font-semibold shadow-md hover:shadow-lg"
        >
          <FaSearch className="mr-2" />
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-lg transition duration-200 flex items-center justify-center font-medium border ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
        >
          <FaFilter className="mr-2" />
          Filters
        </button>
      </form>

      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition duration-200"
              >
                <option value="">All Types</option>
                <option value="car">Four Wheeler (Car)</option>
                <option value="bike">Two Wheeler (Bike)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                placeholder="e.g. Toyota, Honda"
                value={localFilters.brand}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price (₹)</label>
              <input
                type="number"
                placeholder="0"
                step="100"
                value={localFilters.minPrice}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price (₹)</label>
              <input
                type="number"
                placeholder="10000"
                step="100"
                value={localFilters.maxPrice}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition duration-200"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline transition duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

