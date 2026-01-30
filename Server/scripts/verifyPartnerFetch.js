
import mongoose from 'mongoose';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyFetch = async () => {
         try {
                  await mongoose.connect(process.env.MONGODB_URI);
                  console.log('Connected to DB');

                  // 1. Fetch from Partner collection
                  const partnerDocs = await Partner.find({}).select('-password');
                  console.log(`Fetched ${partnerDocs.length} from Partner collection`);

                  // 2. Fetch from User collection
                  const userPartners = await User.find({ role: 'partner' }).select('-password');
                  console.log(`Fetched ${userPartners.length} from User collection`);

                  // 3. Deduplicate logic
                  const partnerEmails = new Set(partnerDocs.map(p => p.email));

                  // Log duplicates for debugging
                  const duplicates = userPartners.filter(u => partnerEmails.has(u.email));
                  if (duplicates.length > 0) {
                           console.log('Duplicates found (will be filtered out):', duplicates.map(d => d.email));
                  }

                  const uniqueUserPartners = userPartners.filter(u => !partnerEmails.has(u.email));
                  console.log(`Unique legacy partners: ${uniqueUserPartners.length}`);

                  // 4. Combine
                  const allPartners = [...partnerDocs, ...uniqueUserPartners];
                  console.log(`Total combined partners: ${allPartners.length}`);

                  // Check for Shohan
                  const shohan = allPartners.find(p => p.email === 'shohan@gmail.com');
                  if (shohan) {
                           console.log('SUCCESS: Shohan is in the final list.');
                           console.log('Shohan Details:', JSON.stringify(shohan, null, 2));
                  } else {
                           console.log('FAILURE: Shohan is NOT in the final list.');
                  }

                  await mongoose.disconnect();
         } catch (error) {
                  console.error(error);
         }
};

verifyFetch();
