# Backend Setup Guide

## 📋 Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - **Local MongoDB**: [Install MongoDB](https://www.mongodb.com/try/download/community)
   - **MongoDB Atlas** (Cloud - Free): [Sign up](https://www.mongodb.com/cloud/atlas/register)
3. **Stripe Account** (for payments): [Sign up](https://stripe.com/) - Free for testing

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies
RANvijay1!@#
```bash
cd Server
npm install
```

### Step 2: Configure Environment Variables

1. Create a `.env` file in the `Server` directory (copy from `.env.example` if available)

2. Fill in the `.env` file with your values:

```env
PORT=5000

# MongoDB - Choose ONE option:

# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/vehicle_rental

# Option B: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vehicle_rental?retryWrites=true&w=majority

# JWT Secret - Generate a secure random string
# You can generate one using: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_change_this_123456789

# Stripe Keys - Get from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Set Up MongoDB

#### Option A: Local MongoDB

1. **Install MongoDB** on your system:
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB service**:
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: `mongod` (or `brew services start mongodb-community` on Mac)

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # or
   mongo
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (choose FREE tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Add the connection string to `.env` as `MONGODB_URI`

**Example:**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/vehicle_rental?retryWrites=true&w=majority
```

### Step 4: Set Up Stripe (For Payments)

1. **Create Stripe Account**:
   - Go to [Stripe](https://stripe.com/)
   - Sign up for a free account
   - You can use test mode (no real charges)

2. **Get API Keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)
   - Add both to your `.env` file

3. **Add to Frontend `.env`** (in `Client/.env`):
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

### Step 5: Generate JWT Secret

Generate a secure random string for JWT_SECRET:

**Using OpenSSL:**
```bash
openssl rand -base64 32
```

**Or use an online generator:**
- Use a random string generator
- Make it at least 32 characters long

Add it to your `.env` file:
```
JWT_SECRET=your_generated_secret_key_here
```

### Step 6: Create Admin User

After setting up MongoDB and running the server at least once, create an admin user:

```bash
npm run create-admin
```

This will create an admin user with:
- **Username**: `admin`
- **Email**: `admin@rentwheels.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change the password after first login!

### Step 7: Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
MongoDB connected
Server running on port 5000
```

## ✅ Verification

1. **Test the server**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"message":"Server is running"}`

2. **Test MongoDB connection**:
   - Check console for "MongoDB connected" message
   - If you see connection errors, verify your `MONGODB_URI` in `.env`

3. **Test API endpoints** (after server is running):
   - Open browser: `http://localhost:5000/api/health`
   - Should show: `{"message":"Server is running"}`

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error: "MongoNetworkError"**
- Check if MongoDB is running (local) or connection string is correct (Atlas)
- Verify network/firewall settings
- For Atlas: Check IP whitelist (add `0.0.0.0/0` for testing)

**Error: "Authentication failed"**
- Verify username and password in connection string
- For Atlas: Check database user credentials

### Port Already in Use

**Error: "Port 5000 already in use"**
- Change `PORT` in `.env` to a different port (e.g., `5001`)
- Update frontend `.env` to match: `VITE_API_URL=http://localhost:5001/api`

### JWT Secret Issues

- Make sure `JWT_SECRET` is set in `.env`
- Use a strong, random string (at least 32 characters)

## 📝 Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `5000` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017/vehicle_rental` |
| `JWT_SECRET` | Yes | Secret key for JWT tokens | `your_random_secret_key` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key | `pk_test_...` |
| `FRONTEND_URL` | No | Frontend URL for CORS | `http://localhost:5173` |

## 🎯 Next Steps

1. ✅ Backend is running
2. ✅ Admin user created
3. ✅ Test endpoints working
4. → Move to frontend setup
5. → Test full application

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Express.js Documentation](https://expressjs.com/)

