import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/axios';
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const confirmPayment = async () => {
      if (sessionId === 'dummy_success') {
        // For dummy payments, we don't need to confirm with the server
        return;
      }

      if (sessionId) {
        try {
          await api.post('/payment/confirm', { sessionId });
        } catch (error) {
          console.error('Payment confirmation error:', error);
        }
      }
    };

    confirmPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View My Bookings
          </Link>
          <Link
            to="/vehicles"
            className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Browse More Vehicles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;

