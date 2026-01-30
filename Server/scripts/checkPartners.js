
import mongoose from 'mongoose';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkPartners = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('Connected to DB');

                  console.log('\n--- Checking specific user: Shohan ---');
                  const shohanUser = await User.findOne({ email: 'shohan@gmail.com' });
                  console.log('Shohan in User collection:', shohanUser ? 'YES' : 'NO');
                  if (shohanUser) console.log(shohanUser);

                  const shohanPartner = await Partner.findOne({ email: 'shohan@gmail.com' });
                  console.log('Shohan in Partner collection:', shohanPartner ? 'YES' : 'NO');
                  if (shohanPartner) console.log(shohanPartner);

                  await mongoose.disconnect();
         } catch (error) {
                  console.error(error);
         }
};

checkPartners();
