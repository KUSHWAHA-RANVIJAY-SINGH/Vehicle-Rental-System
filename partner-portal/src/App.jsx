import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import KYC from './pages/KYC';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyVehicles from './pages/MyVehicles';
import AddVehicle from './pages/AddVehicle';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/kyc" element={<KYC />} />

          {/* Protected Partner Routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<MyVehicles />} />
            <Route path="/add-vehicle" element={<AddVehicle />} />
            <Route path="/edit-vehicle/:id" element={<AddVehicle />} />

            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
