import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

const vehicles = [
  // Cars
  {
    name: 'Toyota Camry 2023',
    type: 'car',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    pricePerDay: 45,
    fuelType: 'hybrid',
    seats: 5,
    transmission: 'automatic',
    description: 'Comfortable and reliable sedan perfect for city driving and long trips. Features modern technology and excellent fuel economy.',
    location: 'New York, NY',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['GPS Navigation', 'Bluetooth', 'Backup Camera', 'Leather Seats', 'Sunroof']
  },
  {
    name: 'Honda Accord 2024',
    type: 'car',
    brand: 'Honda',
    model: 'Accord',
    year: 2024,
    pricePerDay: 48,
    fuelType: 'hybrid',
    seats: 5,
    transmission: 'automatic',
    description: 'Spacious and elegant sedan with advanced safety features and smooth ride quality.',
    location: 'Los Angeles, CA',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['Apple CarPlay', 'Android Auto', 'Lane Assist', 'Cruise Control', 'Heated Seats']
  },
  {
    name: 'BMW 3 Series 2023',
    type: 'car',
    brand: 'BMW',
    model: '3 Series',
    year: 2023,
    pricePerDay: 85,
    fuelType: 'petrol',
    seats: 5,
    transmission: 'automatic',
    description: 'Luxury sedan with powerful engine and premium interior. Perfect for those who want style and performance.',
    location: 'Miami, FL',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['Premium Sound System', 'Leather Interior', 'Sunroof', 'Navigation', 'Parking Sensors']
  },
  {
    name: 'Mercedes-Benz C-Class 2024',
    type: 'car',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    pricePerDay: 90,
    fuelType: 'petrol',
    seats: 5,
    transmission: 'automatic',
    description: 'Elegant luxury sedan with cutting-edge technology and superior comfort.',
    location: 'Chicago, IL',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
    ],
    features: ['MBUX Infotainment', 'Ambient Lighting', 'Premium Audio', 'Adaptive Cruise', '360° Camera']
  },
  {
    name: 'Tesla Model 3 2024',
    type: 'car',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    pricePerDay: 75,
    fuelType: 'electric',
    seats: 5,
    transmission: 'automatic',
    description: 'Fully electric vehicle with autopilot features and impressive acceleration. Zero emissions driving.',
    location: 'San Francisco, CA',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['Autopilot', 'Supercharging', 'Panoramic Roof', 'Premium Interior', 'Over-the-Air Updates']
  },
  {
    name: 'Ford Mustang 2023',
    type: 'car',
    brand: 'Ford',
    model: 'Mustang',
    year: 2023,
    pricePerDay: 95,
    fuelType: 'petrol',
    seats: 4,
    transmission: 'manual',
    description: 'Iconic American muscle car with powerful V8 engine. Perfect for enthusiasts who love driving.',
    location: 'Dallas, TX',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
    ],
    features: ['V8 Engine', 'Sport Mode', 'Premium Audio', 'Racing Seats', 'Performance Package']
  },
  {
    name: 'Audi A4 2023',
    type: 'car',
    brand: 'Audi',
    model: 'A4',
    year: 2023,
    pricePerDay: 80,
    fuelType: 'petrol',
    seats: 5,
    transmission: 'automatic',
    description: 'German engineering meets luxury. Sporty yet comfortable sedan with quattro all-wheel drive.',
    location: 'Seattle, WA',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
    ],
    features: ['Quattro AWD', 'Virtual Cockpit', 'MMI Touch', 'Bang & Olufsen Audio', 'Matrix LED']
  },
  {
    name: 'Jeep Wrangler 2024',
    type: 'car',
    brand: 'Jeep',
    model: 'Wrangler',
    year: 2024,
    pricePerDay: 70,
    fuelType: 'petrol',
    seats: 5,
    transmission: 'manual',
    description: 'Rugged off-road vehicle perfect for adventure seekers. Can handle any terrain with ease.',
    location: 'Denver, CO',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['4x4 Drive', 'Removable Doors', 'Off-Road Package', 'Rock Rails', 'Winch Ready']
  },
  {
    name: 'Nissan Altima 2023',
    type: 'car',
    brand: 'Nissan',
    model: 'Altima',
    year: 2023,
    pricePerDay: 42,
    fuelType: 'petrol',
    seats: 5,
    transmission: 'automatic',
    description: 'Affordable and reliable mid-size sedan with great fuel economy and comfortable ride.',
    location: 'Phoenix, AZ',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
    ],
    features: ['NissanConnect', 'ProPILOT Assist', 'Remote Start', 'Bose Audio', 'Heated Seats']
  },
  {
    name: 'Chevrolet Tahoe 2024',
    type: 'car',
    brand: 'Chevrolet',
    model: 'Tahoe',
    year: 2024,
    pricePerDay: 100,
    fuelType: 'petrol',
    seats: 8,
    transmission: 'automatic',
    description: 'Spacious full-size SUV perfect for families. Can accommodate up to 8 passengers comfortably.',
    location: 'Houston, TX',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800'
    ],
    features: ['Third Row Seating', 'Towing Package', 'Premium Sound', 'Panoramic Sunroof', '360° Camera']
  },
  
  // Bikes
  {
    name: 'Harley-Davidson Sportster 2023',
    type: 'bike',
    brand: 'Harley-Davidson',
    model: 'Sportster',
    year: 2023,
    pricePerDay: 65,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Classic American cruiser motorcycle. Iconic style and powerful performance for an unforgettable ride.',
    location: 'Los Angeles, CA',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800',
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800'
    ],
    features: ['V-Twin Engine', 'Cruise Control', 'ABS Brakes', 'LED Lighting', 'Premium Finish']
  },
  {
    name: 'Honda CBR600RR 2024',
    type: 'bike',
    brand: 'Honda',
    model: 'CBR600RR',
    year: 2024,
    pricePerDay: 55,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Sport bike designed for performance. Perfect for riders who love speed and agility.',
    location: 'Miami, FL',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800',
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800'
    ],
    features: ['Sport Mode', 'Quick Shifter', 'Traction Control', 'Racing Suspension', 'Carbon Fiber']
  },
  {
    name: 'Yamaha R1 2023',
    type: 'bike',
    brand: 'Yamaha',
    model: 'R1',
    year: 2023,
    pricePerDay: 70,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Superbike with track-focused performance. Advanced electronics and powerful engine.',
    location: 'San Francisco, CA',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800',
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800'
    ],
    features: ['Race Mode', 'Launch Control', 'Wheelie Control', 'Quick Shifter', 'Premium Brakes']
  },
  {
    name: 'Ducati Panigale V4 2024',
    type: 'bike',
    brand: 'Ducati',
    model: 'Panigale V4',
    year: 2024,
    pricePerDay: 95,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Italian super sport motorcycle. Exceptional performance and stunning design.',
    location: 'New York, NY',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800',
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800'
    ],
    features: ['V4 Engine', 'Cornering ABS', 'Traction Control', 'Quick Shifter', 'Race Pack']
  },
  {
    name: 'Kawasaki Ninja 650 2023',
    type: 'bike',
    brand: 'Kawasaki',
    model: 'Ninja 650',
    year: 2023,
    pricePerDay: 50,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Versatile sport bike perfect for both city and highway riding. Great balance of performance and comfort.',
    location: 'Chicago, IL',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800',
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800'
    ],
    features: ['ABS Brakes', 'Digital Display', 'LED Lights', 'Comfortable Seating', 'Fuel Efficient']
  },
  {
    name: 'BMW R1250GS 2024',
    type: 'bike',
    brand: 'BMW',
    model: 'R1250GS',
    year: 2024,
    pricePerDay: 85,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Adventure touring motorcycle. Perfect for long trips and off-road adventures.',
    location: 'Denver, CO',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800',
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800'
    ],
    features: ['Adventure Package', 'GPS Navigation', 'Heated Grips', 'ABS Pro', 'Dynamic ESA']
  },
  {
    name: 'Triumph Street Triple 2023',
    type: 'bike',
    brand: 'Triumph',
    model: 'Street Triple',
    year: 2023,
    pricePerDay: 60,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Naked sport bike with character. Great for urban riding and weekend adventures.',
    location: 'Portland, OR',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800',
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800'
    ],
    features: ['Triple Engine', 'TFT Display', 'Ride Modes', 'Quick Shifter', 'ABS & Traction Control']
  },
  {
    name: 'Suzuki Hayabusa 2024',
    type: 'bike',
    brand: 'Suzuki',
    model: 'Hayabusa',
    year: 2024,
    pricePerDay: 75,
    fuelType: 'petrol',
    seats: 2,
    transmission: 'manual',
    description: 'Legendary hyper sport motorcycle. Ultimate speed and performance in a refined package.',
    location: 'Las Vegas, NV',
    available: true,
    images: [
      'https://images.unsplash.com/photo-1558980663-3685c1d673c3?w=800',
      'https://images.unsplash.com/photo-1558980664-1db506751751?w=800'
    ],
    features: ['Turbo Engine', 'Aerodynamic Design', 'Advanced Electronics', 'Premium Brakes', 'Racing Package']
  }
];

const seedVehicles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental');
    console.log('✅ Connected to MongoDB');

    // Clear existing vehicles (optional - comment out if you want to keep existing data)
    // await Vehicle.deleteMany({});
    // console.log('🗑️  Cleared existing vehicles');

    // Insert vehicles
    const insertedVehicles = await Vehicle.insertMany(vehicles);
    console.log(`✅ Successfully seeded ${insertedVehicles.length} vehicles!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Seeded Vehicles:');
    insertedVehicles.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.brand} ${vehicle.model} ${vehicle.year} - $${vehicle.pricePerDay}/day`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error);
    process.exit(1);
  }
};

seedVehicles();

