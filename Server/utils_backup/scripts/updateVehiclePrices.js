import 'dotenv/config';
import mongoose from 'mongoose';
import Vehicle from '../../models/Vehicle.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('MONGODB_URI Length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 'Undefined');

const updates = [
         {
                  "_id": "6947b7f321b3d36351156fd6",
                  "name": "Toyota Corolla 2025",
                  "pricePerDay": 450,
                  "price120": 383,
                  "priceUnlimited": 585
         },
         {
                  "_id": "6947b7f321b3d36351156fd7",
                  "name": "Honda CR-V 2025",
                  "pricePerDay": 650,
                  "price120": 553,
                  "priceUnlimited": 845
         },
         {
                  "_id": "6947b7f321b3d36351156fd8",
                  "name": "BMW 3 Series 2025",
                  "pricePerDay": 950,
                  "price120": 808,
                  "priceUnlimited": 1235
         },
         {
                  "_id": "6947b7f321b3d36351156fd9",
                  "name": "Ford Mustang 2025",
                  "pricePerDay": 1200,
                  "price120": 1020,
                  "priceUnlimited": 1560
         },
         {
                  "_id": "6947b7f321b3d36351156fda",
                  "name": "Hyundai Elantra 2025",
                  "pricePerDay": 400,
                  "price120": 340,
                  "priceUnlimited": 520
         },
         {
                  "_id": "6947b7f321b3d36351156fdb",
                  "name": "Mercedes-Benz S-Class 2025",
                  "pricePerDay": 1500,
                  "price120": 1275,
                  "priceUnlimited": 1950
         },
         {
                  "_id": "6947b7f321b3d36351156fdc",
                  "name": "Royal Enfield Classic 350 2025",
                  "pricePerDay": 600,
                  "price120": 510,
                  "priceUnlimited": 780
         },
         {
                  "_id": "6947b7f321b3d36351156fdd",
                  "name": "Honda CB Hornet 160R 2025",
                  "pricePerDay": 500,
                  "price120": 425,
                  "priceUnlimited": 650
         },
         {
                  "_id": "6947b7f321b3d36351156fde",
                  "name": "Bajaj Pulsar NS200 2025",
                  "pricePerDay": 550,
                  "price120": 468,
                  "priceUnlimited": 715
         },
         {
                  "_id": "6947b7f321b3d36351156fdf",
                  "name": "TVS Apache RTR 160 2025",
                  "pricePerDay": 450,
                  "price120": 383,
                  "priceUnlimited": 585
         },
         {
                  "_id": "6947ec3bec15611d8999393c",
                  "name": "Tata Nexon EV",
                  "pricePerDay": 1800,
                  "price120": 1530,
                  "priceUnlimited": 2340
         },
         {
                  "_id": "6947ec3bec15611d8999393d",
                  "name": "Mahindra Thar 4x4",
                  "pricePerDay": 2500,
                  "price120": 2125,
                  "priceUnlimited": 3250
         },
         {
                  "_id": "6947ec3bec15611d8999393e",
                  "name": "Toyota Innova Crysta",
                  "pricePerDay": 3000,
                  "price120": 2550,
                  "priceUnlimited": 3900
         },
         {
                  "_id": "6947ec3bec15611d8999393f",
                  "name": "Maruti Swift 2024",
                  "pricePerDay": 900,
                  "price120": 765,
                  "priceUnlimited": 1170
         },
         {
                  "_id": "6947ec3bec15611d89993940",
                  "name": "Hyundai Creta SX",
                  "pricePerDay": 1600,
                  "price120": 1360,
                  "priceUnlimited": 2080
         },
         {
                  "_id": "6947ec3bec15611d89993941",
                  "name": "Kia Seltos",
                  "pricePerDay": 1550,
                  "price120": 1318,
                  "priceUnlimited": 2015
         },
         {
                  "_id": "6947ec3bec15611d89993942",
                  "name": "Tata Safari",
                  "pricePerDay": 2800,
                  "price120": 2380,
                  "priceUnlimited": 3640
         },
         {
                  "_id": "6947ec3bec15611d89993943",
                  "name": "Mahindra Scorpio N",
                  "pricePerDay": 2200,
                  "price120": 1870,
                  "priceUnlimited": 2860
         },
         {
                  "_id": "6947ec3bec15611d89993944",
                  "name": "Yamaha R15 V4",
                  "pricePerDay": 800,
                  "price120": 680,
                  "priceUnlimited": 1040
         },
         {
                  "_id": "6947ec3bec15611d89993945",
                  "name": "Honda Activa 6G",
                  "pricePerDay": 350,
                  "price120": 298,
                  "priceUnlimited": 455
         }
];

const updatePrices = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('MongoDB Connected...');

                  for (const item of updates) {
                           const result = await Vehicle.findByIdAndUpdate(
                                    item._id,
                                    {
                                             pricePerDay: item.pricePerDay,
                                             'rentalOptions.daily.limit120.price': item.price120,
                                             'rentalOptions.daily.limit300.price': item.pricePerDay,
                                             'rentalOptions.daily.unlimited.price': item.priceUnlimited,
                                             'rentalOptions.weekly.price': item.pricePerDay * 6,
                                             'rentalOptions.monthly.price': item.pricePerDay * 22
                                    },
                                    { new: true }
                           );

                           if (result) {
                                    console.log(`Updated ${item.name}`);
                           } else {
                                    console.log(`Vehicle not found: ${item.name} (${item._id})`);
                           }
                  }

                  console.log('All updates completed.');
                  process.exit();
         } catch (err) {
                  console.error(err);
                  process.exit(1);
         }
};

updatePrices();
