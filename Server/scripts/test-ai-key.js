import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
         console.error('Error: GEMINI_API_KEY not found in .env');
         process.exit(1);
}

console.log('Testing Gemini API with key ending in:', apiKey.slice(-4));

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
         try {
                  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                  const prompt = "Say 'Hello, World!' if you can hear me.";
                  const result = await model.generateContent(prompt);
                  const response = await result.response;
                  const text = response.text();
                  console.log('Success! API Response:', text);
         } catch (error) {
                  console.error('API Test Failed:', error.message);
                  process.exit(1);
         }
}

test();
