
// Default placeholder images
export const DEFAULT_CAR_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop';
export const DEFAULT_BIKE_IMAGE = 'https://images.unsplash.com/photo-1558980664-1db506751751?w=800&h=600&fit=crop';

/**
 * Generates the full URL for a vehicle image.
 * Handles both absolute URLs (http/https) and relative paths (uploads/...).
 * 
 * @param {Object} vehicle - The vehicle object from the API
 * @param {number} index - The index of the image in the images array (default 0)
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

         let url = vehicle.images[index];

         // If it's an absolute URL, return it
         if (url.startsWith('http://') || url.startsWith('https://')) {
                  return url;
         }

         // If it's a data URI (base64), return it
         if (url.startsWith('data:')) {
                  return url;
         }

         // FIX: Handle legacy absolute system paths (e.g., /home/user/.../uploads/...)
         // If we find 'uploads/' in the path, we assume everything after is the relative path
         if (url.includes('uploads/')) {
                  const parts = url.replace(/\\/g, '/').split('uploads/');
                  if (parts.length > 1) {
                           // Take the last part (in case uploads appears multiple times, extremely unlikely but safe)
                           // and prepend 'uploads/' to make it relative
                           url = 'uploads/' + parts.pop();
                  }
         }

         // It's likely a relative path (e.g. "uploads/image.jpg")

         // If it starts with /src/, it's a local Vite asset (e.g. from dummy data imports).
         // Return it as is to be served by the frontend dev server.
         if (url.startsWith('/src/') || url.startsWith('src/')) {
                  return url.startsWith('/') ? url : `/${url}`;
         }

         // We try to derive the server root from VITE_API_URL or default to localhost:5000
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
