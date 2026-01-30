import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateWithGroq = async (brand, model, features) => {
         if (!process.env.GROQ_API_KEY) {
                  throw new Error('GROQ_API_KEY is not configured on the server.');
         }

         const featureList = Array.isArray(features) ? features.join(', ') : features || 'standard features';
         const prompt = `Write a short, attractive, 2-sentence marketing description for a vehicle to be used on a rental site. 
    It is a ${brand} ${model}. Key features include: ${featureList}. 
    Make it sound appealing to potential renters. Do not include quotes or markdown in the response, just the plain text.`;

         const response = await axios.post(
                  'https://api.groq.com/openai/v1/chat/completions',
                  {
                           messages: [{ role: 'user', content: prompt }],
                           model: 'llama-3.1-8b-instant',
                  },
                  {
                           headers: {
                                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                                    'Content-Type': 'application/json',
                           },
                  }
         );

         return response.data.choices[0].message.content.trim();
};

export const generateDescription = async (req, res) => {
         const { brand, model, features } = req.body;

         if (!brand || !model) {
                  return res.status(400).json({ message: 'Brand and Model are required details.' });
         }

         try {
                  if (!process.env.GEMINI_API_KEY) {
                           throw new Error('GEMINI_API_KEY is not configured.');
                  }

                  const featureList = Array.isArray(features) ? features.join(', ') : features || 'standard features';

                  const prompt = `Write a short, attractive, 2-sentence marketing description for a vehicle to be used on a rental site. 
    It is a ${brand} ${model}. Key features include: ${featureList}. 
    Make it sound appealing to potential renters. Do not include quotes or markdown in the response, just the plain text.`;

                  const aiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
                  const result = await aiModel.generateContent(prompt);
                  const response = await result.response;
                  const text = response.text();

                  res.json({ description: text.trim() });
         } catch (error) {
                  console.warn('Gemini API failed, attempting fallback to Groq:', error.message);

                  try {
                           const groqText = await generateWithGroq(brand, model, features);
                           res.json({ description: groqText, source: 'groq' });
                  } catch (groqError) {
                           console.error('Groq Fallback also failed:', groqError.message);
                           res.status(500).json({
                                    message: 'Failed to generate description with both providers',
                                    geminiError: error.message,
                                    groqError: groqError.message
                           });
                  }
         }
};
