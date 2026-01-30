import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Login = () => {
         const navigate = useNavigate();
         const [formData, setFormData] = useState({ email: "", password: "" });
         const [showPassword, setShowPassword] = useState(false);
         const [loading, setLoading] = useState(false);

         const handleChange = (e) => {
                  setFormData({ ...formData, [e.target.name]: e.target.value });
         };

         const handleSubmit = async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  try {
                           const res = await api.post('/auth/partner/login', formData);
                           localStorage.setItem('token', res.data.token);
                           localStorage.setItem('user', JSON.stringify(res.data.user));

                           if (res.data.user.role === 'partner' || res.data.user.role === 'admin') {
                                    // Admin allowed for testing, or strictly partner
                                    navigate('/dashboard');
                                    toast.success(`Welcome back, ${res.data.user.username}!`);
                           } else {
                                    toast.error('Access denied. Partners only.');
                                    localStorage.clear();
                           }
                  } catch (err) {
                           toast.error(err.response?.data?.message || 'Login failed');
                  } finally {
                           setLoading(false);
                  }
         };

         const handleGoogleSuccess = async (credentialResponse) => {
                  try {
                           const res = await api.post('/auth/partner/google', { tokenId: credentialResponse.credential });
                           localStorage.setItem('token', res.data.token);
                           localStorage.setItem('user', JSON.stringify(res.data.user));

                           // Check role or force update role?
                           // If user logs in with Google and is "renter", we might want to prompt them to become a partner?
                           // For now, let's just check access.
                           if (res.data.user.role === 'partner' || res.data.user.role === 'admin') {
                                    navigate('/dashboard');
                                    toast.success(`Welcome back, ${res.data.user.username}!`);
                           } else {
                                    // Maybe redirect to an "upgrade" page or auto-upgrade?
                                    // Let's just deny for now or redirect to signup to "Become a Partner"
                                    toast.error('Account is not a Partner account.');
                                    localStorage.clear();
                           }

                  } catch (error) {
                           console.error('Google Login Error', error);
                           toast.error('Google Login Failed');
                  }
         };

         return (
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
                           <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6 border border-gray-100">
                                    <div className="text-center">
                                             <h2 className="text-3xl font-bold text-gray-800">
                                                      Partner Portal Login 👋
                                             </h2>
                                             <p className="text-sm text-gray-500 mt-2">
                                                      Sign in to manage your vehicle fleet
                                             </p>
                                    </div>

                                    <form className="space-y-5" onSubmit={handleSubmit}>
                                             {/* Email Input */}
                                             <div>
                                                      <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                                                               Email Address
                                                      </label>
                                                      <input
                                                               id="email"
                                                               name="email"
                                                               type="email"
                                                               required
                                                               placeholder="example@email.com"
                                                               value={formData.email}
                                                               onChange={handleChange}
                                                               className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                                                      />
                                             </div>

                                             {/* Password Input */}
                                             <div className="relative">
                                                      <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                                                               Password
                                                      </label>
                                                      <input
                                                               id="password"
                                                               name="password"
                                                               type={showPassword ? "text" : "password"}
                                                               required
                                                               placeholder="••••••••"
                                                               value={formData.password}
                                                               onChange={handleChange}
                                                               className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200 pr-10"
                                                      />
                                                      <button
                                                               type="button"
                                                               className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                                                               onClick={() => setShowPassword(!showPassword)}
                                                      >
                                                               {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                      </button>
                                             </div>

                                             {/* Submit Button */}
                                             <button
                                                      type="submit"
                                                      disabled={loading}
                                                      className="w-full py-2 px-4 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50"
                                             >
                                                      {loading ? "Signing in..." : "Sign In"}
                                             </button>

                                             <div className="relative flex py-2 items-center">
                                                      <div className="flex-grow border-t border-gray-300"></div>
                                                      <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with</span>
                                                      <div className="flex-grow border-t border-gray-300"></div>
                                             </div>

                                             <div className="flex justify-center">
                                                      <GoogleLogin
                                                               onSuccess={handleGoogleSuccess}
                                                               onError={() => {
                                                                        console.log('Login Failed');
                                                                        toast.error('Google Login Failed');
                                                               }}
                                                      />
                                             </div>

                                             {/* Register Link */}
                                             <p className="text-center text-sm text-gray-600">
                                                      Don’t have a partner account?{" "}
                                                      <Link
                                                               to="/signup"
                                                               className="text-blue-600 font-medium hover:underline hover:text-blue-700"
                                                      >
                                                               Register here
                                                      </Link>
                                             </p>
                                    </form>
                           </div>
                  </div>
         );
};

export default Login;
