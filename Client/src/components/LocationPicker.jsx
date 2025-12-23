import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
         iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
         iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MAP_API_KEY = import.meta.env.VITE_MAP_API_KEY;

function LocationMarker({ onLocationSelect, forcedPosition }) {
         const [position, setPosition] = useState(null);
         const map = useMap();

         useEffect(() => {
                  if (forcedPosition) {
                           const newPos = { lat: forcedPosition.lat, lng: forcedPosition.lng };
                           setPosition(newPos);
                           map.flyTo(newPos, 16);
                  }
         }, [forcedPosition, map]);

         useMapEvents({
                  click: async (e) => {
                           const { lat, lng } = e.latlng;
                           setPosition(e.latlng);
                           map.flyTo(e.latlng, map.getZoom());

                           try {
                                    const response = await axios.get(
                                             `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAP_API_KEY}`
                                    );

                                    if (response.data && response.data.features && response.data.features.length > 0) {
                                             const address = response.data.features[0].place_name;
                                             onLocationSelect({
                                                      lat,
                                                      lng,
                                                      address
                                             });
                                    }
                           } catch (error) {
                                    console.error("Error fetching address:", error);
                           }
                  },
         });

         return position === null ? null : (
                  <Marker position={position}></Marker>
         );
}

const LocationPicker = ({ onClose, onConfirm }) => {
         const [selectedLocation, setSelectedLocation] = useState(null);
         const [searchQuery, setSearchQuery] = useState('');
         const [searchResults, setSearchResults] = useState([]);
         const [isSearching, setIsSearching] = useState(false);

         const handleConfirm = () => {
                  if (selectedLocation) {
                           onConfirm(selectedLocation.address);
                           onClose();
                  }
         };

         const handleCurrentLocation = () => {
                  if (navigator.geolocation) {
                           navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                             const { latitude, longitude } = position.coords;

                                             try {
                                                      const response = await axios.get(
                                                               `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAP_API_KEY}`
                                                      );

                                                      if (response.data && response.data.features && response.data.features.length > 0) {
                                                               const address = response.data.features[0].place_name;
                                                               setSelectedLocation({
                                                                        lat: latitude,
                                                                        lng: longitude,
                                                                        address
                                                               });
                                                      }
                                             } catch (error) {
                                                      console.error("Error fetching current location address:", error);
                                                      alert("Could not fetch address for your location.");
                                             }
                                    },
                                    (error) => {
                                             console.error("Error getting location:", error);
                                             alert("Could not retrieve your location. Please enable location services.");
                                    }
                           );
                  } else {
                           alert("Geolocation is not supported by this browser.");
                  }
         };


         const handleSearch = async (e) => {
                  e.preventDefault();
                  if (!searchQuery.trim()) return;

                  setIsSearching(true);
                  try {
                           const response = await axios.get(
                                    `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAP_API_KEY}&bbox=68.0,6.0,98.0,38.0`
                           );

                           if (response.data && response.data.features) {
                                    setSearchResults(response.data.features);
                           }
                  } catch (error) {
                           console.error("Error searching location:", error);
                  } finally {
                           setIsSearching(false);
                  }
         };

         const handleSelectResult = (result) => {
                  const [lng, lat] = result.center;
                  const address = result.place_name;

                  setSelectedLocation({
                           lat,
                           lng,
                           address
                  });
                  setSearchResults([]);
                  setSearchQuery('');
         };

         return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                           <div className="bg-white p-4 rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-1/2 h-3/4 flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                             <h3 className="text-lg font-bold">Select Location</h3>
                                             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                                      ✕
                                             </button>
                                    </div>

                                    {/* Search Box */}
                                    <div className="relative mb-4 z-[500]">
                                             <form onSubmit={handleSearch} className="flex gap-2">
                                                      <input
                                                               type="text"
                                                               value={searchQuery}
                                                               onChange={(e) => setSearchQuery(e.target.value)}
                                                               placeholder="Search for a location..."
                                                               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                      />
                                                      <button
                                                               type="submit"
                                                               disabled={isSearching}
                                                               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                                                      >
                                                               {isSearching ? '...' : 'Search'}
                                                      </button>
                                             </form>

                                             {searchResults.length > 0 && (
                                                      <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-1 max-h-60 overflow-y-auto border border-gray-200">
                                                               {searchResults.map((result) => (
                                                                        <div
                                                                                 key={result.id}
                                                                                 onClick={() => handleSelectResult(result)}
                                                                                 className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm text-gray-700"
                                                                        >
                                                                                 {result.place_name}
                                                                        </div>
                                                               ))}
                                                      </div>
                                             )}
                                    </div>

                                    <div className="flex-1 rounded-lg overflow-hidden border border-gray-300 relative mb-4">
                                             <MapContainer
                                                      center={[20.5937, 78.9629]} // Default to India center
                                                      zoom={5}
                                                      style={{ height: '100%', width: '100%' }}
                                                      minZoom={4}
                                                      maxBounds={[
                                                               [6.0, 68.0], // Southwest coordinates
                                                               [38.0, 98.0]  // Northeast coordinates
                                                      ]}
                                                      maxBoundsViscosity={1.0}
                                             >
                                                      <TileLayer
                                                               url={`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${MAP_API_KEY}`}
                                                               attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                                      />
                                                      <LocationMarker
                                                               onLocationSelect={setSelectedLocation}
                                                               forcedPosition={selectedLocation}
                                                      />
                                             </MapContainer>

                                             {/* Current Location Button Overlay */}
                                             <button
                                                      onClick={handleCurrentLocation}
                                                      className="absolute bottom-4 right-4 z-[400] bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                                                      title="Use My Current Location"
                                             >
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                      </svg>
                                             </button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                             <p className="text-sm text-gray-600 truncate flex-1 mr-4">
                                                      {selectedLocation ? `Selected: ${selectedLocation.address}` : "Click on map to select location"}
                                             </p>
                                             <button
                                                      onClick={handleConfirm}
                                                      disabled={!selectedLocation}
                                                      className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${selectedLocation ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                                                               }`}
                                             >
                                                      Confirm Location
                                             </button>
                                    </div>
                           </div>
                  </div>
         );
};

export default LocationPicker;
