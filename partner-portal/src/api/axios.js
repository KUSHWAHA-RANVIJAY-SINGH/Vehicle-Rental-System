import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
         baseURL: 'https://vehicle-rental-system-api.onrender.com/api',
         headers: {
                  'Content-Type': 'application/json',
         },
});

// Request interceptor: Attach Token
api.interceptors.request.use((config) => {
         const token = localStorage.getItem('token');
         if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
         }
         return config;
}, (error) => Promise.reject(error));

// Response interceptor: Handle Errors
api.interceptors.response.use((response) => response, (error) => {
         if (error.response && error.response.status === 403) {
                  // If backend says Forbidden (role mismatch), prompt logout
                  // We can't use useNavigate hook outside React component easily used here without hacking.
                  // So we just toast or redirect via window.
                  toast.error('Access Denied: You may need to login again to update permissions.');
         }
         if (error.response && error.response.status === 401) {
                  // Unauthorized - Token expired or invalid
                  // Optional: Auto logout
                  // localStorage.clear();
                  // window.location.href = '/login';
         }
         return Promise.reject(error);
});

export default api;
