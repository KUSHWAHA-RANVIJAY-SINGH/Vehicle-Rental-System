import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VehicleForm from '../components/VehicleForm';
import api from '../api/axios';

const AddVehicle = () => {
         const navigate = useNavigate();
         const { id } = useParams();
         const [vehicle, setVehicle] = useState(null);
         const [loading, setLoading] = useState(!!id);

         useEffect(() => {
                  if (id) {
                           fetchVehicle();
                  }
         }, [id]);

         const fetchVehicle = async () => {
                  try {
                           setLoading(true);
                           const { data } = await api.get(`/vehicles/${id}`);
                           setVehicle(data);
                  } catch (error) {
                           console.error('Error fetching vehicle:', error);
                           alert('Failed to fetch vehicle details');
                           navigate('/vehicles');
                  } finally {
                           setLoading(false);
                  }
         };

         if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;

         return (
                  <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                           <h2 className="text-2xl font-bold mb-6 text-gray-800">{id ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                           <VehicleForm vehicle={vehicle} onSuccess={() => navigate('/vehicles')} />
                  </div>
         );
};

export default AddVehicle;
