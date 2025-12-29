# Vehicle Rental System - MERN Stack Application

A complete car and bike rental website built with the MERN stack (MongoDB, Express, React, Node.js) featuring JWT authentication and Stripe payment integration.

## 🚀 Features

### User Features
- Browse all available cars and bikes
- Search & filter vehicles by type, price, brand, or availability
- View detailed information for each vehicle
- Book a vehicle with date selection and pickup/drop-off locations
- Secure payment processing with Stripe
- View booking history in user dashboard
- User registration, login, and logout with JWT authentication

### Admin Features
- Secure admin login
- CRUD operations for vehicles (add, edit, delete)
- Manage all bookings (approve/cancel)
- View dashboard analytics (total vehicles, revenue, active bookings)
- User management

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite + TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Payments:** Stripe
- **State Management:** Redux Toolkit
- **Routing:** React Router v6

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payments)

### Backend Setup

1. Navigate to the Server directory:
```bash
cd Server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vehicle_rental
JWT_SECRET=your_jwt_secret_key_here_change_in_production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Client directory:
```bash
cd Client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Client directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
Vehicle_Rental_System/
├── Client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   └── utils/         # Utility functions
│   └── package.json
├── Server/                 # Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with optional filters)
  - Optional query `start` and `end` (ISO dates) will return only vehicles available for that date range
- `GET /api/vehicles/:id` - Get single vehicle
- `GET /api/vehicles/:id/availability?start=<ISO>&end=<ISO>` - Check vehicle availability for a date range (returns `{ available: boolean, conflict?: { id, pickupDate, dropoffDate } }`)
- `GET /api/recommendations/user/:id?limit=3` - Personalized recommendations for a user (authenticated) — returns up to `limit` vehicles and a short `meta` object.
- `POST /api/vehicles` - Create vehicle (admin only)
- `PUT /api/vehicles/:id` - Update vehicle (admin only)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin only)

### Bookings
- `POST /api/bookings` - Create booking (authenticated)
  - Server verifies that the vehicle is available for the requested date range and will return 409 Conflict if dates overlap with an existing pending/confirmed booking.
  - Recommend calling `GET /api/vehicles/:id/availability?start=<ISO>&end=<ISO>` before attempting to create a booking to provide faster feedback to users.
- `GET /api/bookings/user/:id` - Get user's bookings
- `GET /api/bookings` - Get all bookings (admin only)
- `PUT /api/bookings/:id/status` - Update booking status (admin only)
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payment/create-checkout-session` - Create Stripe checkout
- `POST /api/payment/confirm` - Confirm payment

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation with express-validator
- CORS configuration
- XSS prevention

## 📝 Usage

1. **Register/Login:** Create an account or login to access the platform
2. **Browse Vehicles:** View all available cars and bikes
3. **Search & Filter:** Find vehicles by type, brand, price, etc.
4. **Book Vehicle:** Select dates and locations, then proceed to payment
5. **Payment:** Complete payment securely via Stripe
6. **Dashboard:** View your bookings and manage your account

### Admin Access

To create an admin user, you can either:
1. Manually update the user document in MongoDB to set `role: 'admin'`
2. Create a script to seed an admin user

## 🎨 Design

The application features:
- Responsive design (mobile-first)
- Modern UI with TailwindCSS
- Blue color scheme (#007BFF)
- Smooth animations and transitions
- React Icons for visual elements

## 🚧 Future Enhancements

- Email notifications
- Vehicle reviews and ratings
- Advanced filtering options
- Image upload functionality
- Real-time chat support
- Mobile app version

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note:** Make sure to replace all placeholder values in `.env` files with your actual credentials before running the application.

