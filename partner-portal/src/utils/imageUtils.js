
// Default placeholder images
export const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
export const DEFAULT_BIKE_IMAGE = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';

/**
 * Generates the full URL for a vehicle image.
 * Handles both absolute URLs (http/https) and relative paths (uploads/...).
 * 
 * @param {Object} vehicle - The vehicle object from the API
 * @param {number} index - The index of the image in the index array (default 0)
 * @returns {string} The resolved image URL
 */
export const getVehicleImageUrl = (vehicle, index = 0) => {
         if (!vehicle) return DEFAULT_CAR_IMAGE;

         // Determine default based on type
         const defaultImage = vehicle.type === 'bike' ? DEFAULT_BIKE_IMAGE : DEFAULT_CAR_IMAGE;

         // Check if image exists at index
         if (!vehicle.images || vehicle.images.length <= index || !vehicle.images[index]) {
                  return defaultImage;
         }

         const url = vehicle.images[index];

         // If it's an absolute URL, return it
         if (url.startsWith('http://') || url.startsWith('https://')) {
                  return url;
         }

         // If it starts with /src/, it's a local Vite asset from the Client project.
         // Since we are in Partner Portal (port 5174), we can't serve it directly.
         // We'll point to the Client server (port 5173) for these legacy seeded images.
         if (url.startsWith('/src/') || url.startsWith('src/')) {
                  const path = url.startsWith('/') ? url : `/${url}`;
                  return `http://localhost:5173${path}`;
         }
         // If it's a data URI (base64), return it
         if (url.startsWith('data:')) {
                  return url;
         }

         // We try to derive the server root from VITE_API_URL or default to localhost:5000
         // Note: Partner portal might not have VITE_API_URL set, so hardcoded fallback is important
         let serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

         // Remove '/api' suffix if present to get the root
         if (serverUrl.endsWith('/api')) {
                  serverUrl = serverUrl.slice(0, -4);
         }
         // Ensure no trailing slash
         if (serverUrl.endsWith('/')) {
                  serverUrl = serverUrl.slice(0, -1);
         }

         // Ensure url has leading slash if needed
         // also normalize backslashes from windows paths if any
         const normalizedUrl = url.replace(/\\/g, '/');
         const normalizedPath = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;

         return `${serverUrl}${normalizedPath}`;
};
