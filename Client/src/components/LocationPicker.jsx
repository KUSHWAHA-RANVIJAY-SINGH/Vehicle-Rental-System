import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import useDebounce from '../hooks/useDebounce';

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
                           if (map) map.flyTo(newPos, 16);
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
                                             onLocationSelect({ lat, lng, address });
                                    }
                           } catch (error) {
                                    console.error('Error fetching address:', error);
                           }
                  },
         });

         return position === null ? null : <Marker position={position} />;
}

const LocationPicker = ({ onClose, onConfirm, variant = 'drawer' }) => {
         const [selectedLocation, setSelectedLocation] = useState(null);
         const [searchQuery, setSearchQuery] = useState('');
         const [searchResults, setSearchResults] = useState([]);
         const [isSearching, setIsSearching] = useState(false);
         const debouncedQuery = useDebounce(searchQuery, 500);
         const panelRef = useRef(null);

         // Click outside to close (when variant is drawer)
         useEffect(() => {
                  const onClick = (e) => {
                           if (variant === 'drawer' && panelRef.current && !panelRef.current.contains(e.target)) {
                                    onClose();
                           }
                  };
                  document.addEventListener('mousedown', onClick);
                  return () => document.removeEventListener('mousedown', onClick);
         }, [onClose, variant]);

         // Search when debounced query changes
         useEffect(() => {
                  const doSearch = async () => {
                           const q = debouncedQuery && debouncedQuery.trim();
                           if (!q) {
                                    setSearchResults([]);
                                    setIsSearching(false);
                                    return;
                           }

                           setIsSearching(true);
                           try {
                                    const response = await axios.get(
                                             `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${MAP_API_KEY}&bbox=68.0,6.0,98.0,38.0&limit=8`
                                    );
                                    if (response.data && response.data.features) {
                                             setSearchResults(response.data.features);
                                    }
                           } catch (err) {
                                    console.error('Location search failed', err);
                           } finally {
                                    setIsSearching(false);
                           }
                  };

                  doSearch();
         }, [debouncedQuery]);

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
                                                               setSelectedLocation({ lat: latitude, lng: longitude, address });
                                                      }
                                             } catch (error) {
                                                      console.error('Error fetching current location address:', error);
                                                      alert('Could not fetch address for your location.');
                                             }
                                    },
                                    (error) => {
                                             console.error('Error getting location:', error);
                                             alert('Could not retrieve your location. Please enable location services.');
                                    }
                           );
                  } else {
                           alert('Geolocation is not supported by this browser.');
                  }
         };

         const handleSelectResult = (result) => {
                  const [lng, lat] = result.center;
                  const address = result.place_name;
                  setSelectedLocation({ lat, lng, address });
                  setSearchResults([]);
                  setSearchQuery('');
         };

         // Immediate search via submit (fallback)
         const handleSubmit = async (e) => {
                  e?.preventDefault();
                  if (!searchQuery.trim()) return;
                  setIsSearching(true);
                  try {
                           const response = await axios.get(
                                    `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAP_API_KEY}&bbox=68.0,6.0,98.0,38.0&limit=8`
                           );
                           if (response.data && response.data.features) setSearchResults(response.data.features);
                  } catch (err) {
                           console.error('Location search failed', err);
                  } finally {
                           setIsSearching(false);
                  }
         };

         const DrawerWrapper = ({ children }) => (
                  <div className="fixed inset-0 z-50 flex">
                           <div className="absolute inset-0 bg-black bg-opacity-40" aria-hidden />
                           <aside
                                    ref={panelRef}
                                    className="ml-auto w-full sm:w-96 md:w-1/3 bg-white h-full shadow-xl transform transition-transform"
                                    role="dialog"
                                    aria-modal="true"
                           >
                                    {children}
                           </aside>
                  </div>
         );

         const ModalWrapper = ({ children }) => (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                           <div ref={panelRef} className="bg-white p-4 rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-1/2 h-3/4 flex flex-col">
                                    {children}
                           </div>
                  </div>
         );

         const Wrapper = variant === 'drawer' ? DrawerWrapper : ModalWrapper;

         return (
                  <Wrapper>
                           <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between p-4 border-b">
                                             <h3 className="text-lg font-bold">Select location</h3>
                                             <div className="flex items-center gap-2">
                                                      <button
                                                               onClick={handleCurrentLocation}
                                                               title="Use my current location"
                                                               className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                                                      >
                                                               My Location
                                                      </button>
                                                      <button onClick={onClose} className="text-gray-500 hover:text-gray-700 px-3 py-2">
                                                               ✕
                                                      </button>
                                             </div>
                                    </div>

                                    <div className="p-4">
                                             <form onSubmit={handleSubmit} className="relative">
                                                      <input
                                                               type="text"
                                                               value={searchQuery}
                                                               onChange={(e) => setSearchQuery(e.target.value)}
                                                               placeholder="Search address or place"
                                                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                               aria-label="Search address"
                                                      />
                                                      <button
                                                               type="submit"
                                                               disabled={isSearching}
                                                               className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                                                      >
                                                               {isSearching ? '...' : 'Search'}
                                                      </button>

                                                      {searchResults.length > 0 && (
                                                               <div className="mt-2 bg-white border rounded-md shadow-sm max-h-64 overflow-y-auto">
                                                                        {searchResults.map((r) => (
                                                                                 <button
                                                                                          key={r.id}
                                                                                          type="button"
                                                                                          onClick={() => handleSelectResult(r)}
                                                                                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                                                                                 >
                                                                                          <div className="text-sm font-medium">{r.place_name}</div>
                                                                                          {r.properties?.country && (
                                                                                                   <div className="text-xs text-gray-500">{r.properties.country}</div>
                                                                                          )}
                                                                                 </button>
                                                                        ))}
                                                               </div>
                                                      )}
                                             </form>
                                    </div>

                                    <div className="flex-1 p-4 overflow-hidden">
                                             <div className="h-full rounded-md border overflow-hidden">
                                                      <MapContainer
                                                               center={[20.5937, 78.9629]}
                                                               zoom={5}
                                                               style={{ height: '100%', width: '100%' }}
                                                               minZoom={4}
                                                               maxBounds={[[6.0, 68.0], [38.0, 98.0]]}
                                                               maxBoundsViscosity={1.0}
                                                      >
                                                               <TileLayer
                                                                        url={`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${MAP_API_KEY}`}
                                                                        attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                                               />
                                                               <LocationMarker onLocationSelect={setSelectedLocation} forcedPosition={selectedLocation} />
                                                      </MapContainer>
                                             </div>
                                    </div>

                                    <div className="p-4 border-t flex items-center justify-between">
                                             <p className="text-sm text-gray-600 truncate flex-1 mr-4">{selectedLocation ? `Selected: ${selectedLocation.address}` : "Click on map or choose a suggestion"}</p>
                                             <div className="flex items-center gap-3">
                                                      <button onClick={() => { setSelectedLocation(null); setSearchResults([]); }} className="px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100">Clear</button>
                                                      <button
                                                               onClick={handleConfirm}
                                                               disabled={!selectedLocation}
                                                               className={`px-4 py-2 rounded-md font-semibold text-white ${selectedLocation ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                                      >
                                                               Confirm
                                                      </button>
                                             </div>
                                    </div>
                           </div>
                  </Wrapper>
         );
};

export default LocationPicker;
