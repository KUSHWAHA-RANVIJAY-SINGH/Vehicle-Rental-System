import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from '../../models/Vehicle.js';

dotenv.config();

// Helper function to extract brand and model from name
const parseVehicleName = (name) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return {
      brand: parts[0],
      model: parts.slice(1).join(' ')
    };
  }
  return {
    brand: name,
    model: name
  };
};

// Helper function to extract seats and transmission from specs
const parseSpecs = (specs) => {
  let seats = 5;
  let transmission = 'automatic';
  const features = [];

  specs.forEach(spec => {
    if (spec.includes('Seat')) {
      const seatMatch = spec.match(/(\d+)\s*Seat/i);
      if (seatMatch) seats = parseInt(seatMatch[1]);
    } else if (spec.toLowerCase().includes('automatic')) {
      transmission = 'automatic';
    } else if (spec.toLowerCase().includes('manual')) {
      transmission = 'manual';
    } else {
      features.push(spec);
    }
  });

  return { seats, transmission, features };
};

// Helper function to map vehicle type
const mapVehicleType = (type) => {
  const typeMap = {
    'economy': 'car',
    'suv': 'car',
    'luxury': 'car',
    'sports': 'car',
    'bike': 'bike'
  };
  return typeMap[type.toLowerCase()] || 'car';
};

const vehicles = [
  // Wireframe vehicles data
  {
    name: 'Toyota Corolla',
    type: 'economy',
    image: 'https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Toyota-Corolla/4538/1544534285920/front-left-side-47.jpg',
    specs: ['5 Seats', 'Automatic', 'Air Conditioning'],
    price: 450,
    badge: 'Popular'
  },
  {
    name: 'Honda CR-V',
    type: 'suv',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    specs: ['7 Seats', 'Automatic', 'Air Conditioning'],
    price: 650,
    badge: 'Family Choice'
  },
  {
    name: 'BMW 3 Series',
    type: 'luxury',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    specs: ['5 Seats', 'Automatic', 'Premium Sound'],
    price: 950,
    badge: 'Luxury'
  },
  {
    name: 'Ford Mustang',
    type: 'sports',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    specs: ['4 Seats', 'Manual', 'Sports Package'],
    price: 1200,
    badge: 'Sports'
  },
  {
    name: 'Hyundai Elantra',
    type: 'economy',
    image: 'https://hips.hearstapps.com/hmg-prod/images/2024-hyundai-elantra-n-lightning-lap-2025-178-67b0a408c7cd0.jpg?crop=0.498xw:0.373xh;0.285xw,0.387xh&resize=1200:*',
    specs: ['5 Seats', 'Automatic', 'Fuel Efficient'],
    price: 400,
    badge: 'Economy'
  },
  {
    name: 'Mercedes-Benz S-Class',
    type: 'luxury',
    image: 'https://stimg.cardekho.com/images/carexteriorimages/930x620/Mercedes-Benz/S-Class/10853/1690451611932/front-left-side-47.jpg',
    specs: ['5 Seats', 'Automatic', 'Premium Features'],
    price: 1500,
    badge: 'Premium'
  },
  {
    name: 'Royal Enfield Classic 350',
    type: 'bike',
    image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/183389/classic-350-right-front-three-quarter-2.jpeg?isig=0&q=80',
    specs: ['1 Seats', 'Manual', 'Fuel Efficient'],
    price: 600,
    badge: 'Classic'
  },
  {
    name: 'Honda CB Hornet 160R',
    type: 'bike',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    specs: ['2 Seats', 'Manual', 'Sporty Design'],
    price: 500,
    badge: 'Sporty'
  },
  {
    name: 'Bajaj Pulsar NS200',
    type: 'bike',
    image: 'https://cdn.bikedekho.com/processedimages/bajaj/bajaj-pulsar-200-ns/source/bajaj-pulsar-200-ns68a6c52da4533.jpg?imwidth=412&impolicy=resize',
    specs: ['2 Seats', 'Manual', 'High Performance'],
    price: 550,
    badge: 'Performance'
  },
  {
    name: 'TVS Apache RTR 160',
    type: 'bike',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    specs: ['2 Seats', 'Manual', 'Racing DNA'],
    price: 450,
    badge: 'Racing'
  }
].map(vehicle => {
  const { brand, model } = parseVehicleName(vehicle.name);
  const { seats, transmission, features } = parseSpecs(vehicle.specs);
  const vehicleType = mapVehicleType(vehicle.type);

  return {
    name: `${vehicle.name} ${new Date().getFullYear()}`,
    type: vehicleType,
    brand: brand,
    model: model,
    year: new Date().getFullYear(),
    pricePerDay: vehicle.price,
    rentalOptions: {
      daily: {
        limit120: { price: Math.round(vehicle.price * 0.85) },
        limit300: { price: vehicle.price },
        unlimited: { price: Math.round(vehicle.price * 1.3) }
      },
      weekly: {
        price: vehicle.price * 6
      },
      monthly: {
        price: vehicle.price * 22
      }
    },
    fuelType: 'petrol',
    seats: seats,
    transmission: transmission,
    description: `${vehicle.name} - ${vehicle.badge} choice. ${features.join(', ')}.`,
    location: 'Mumbai, India',
    available: true,
    images: [vehicle.image],
    features: features.length > 0 ? features : [vehicle.badge]
  };
});

const seedVehicles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle_rental');
    console.log('✅ Connected to MongoDB');

    // Clear existing vehicles (optional - comment out if you want to keep existing data)
    // await Vehicle.deleteMany({});
    // console.log('🗑️  Cleared existing vehicles');

    // Insert vehicles
    // Clear existing vehicles first
    await Vehicle.deleteMany({});
    console.log('🗑️  Cleared existing vehicles');

    const insertedVehicles = await Vehicle.insertMany(vehicles);
    console.log(`✅ Successfully seeded ${insertedVehicles.length} vehicles!`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Seeded Vehicles:');
    insertedVehicles.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.brand} ${vehicle.model} ${vehicle.year} - ₹${vehicle.pricePerDay}/day`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding vehicles:', error);
    process.exit(1);
  }
};

seedVehicles();
