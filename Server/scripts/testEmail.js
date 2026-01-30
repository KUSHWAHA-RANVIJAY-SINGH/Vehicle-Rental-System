import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to .env in Server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const testEmail = async () => {
         console.log('--- Email Configuration Test ---');
         console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
         console.log('EMAIL_USER:', process.env.EMAIL_USER);
         // Mask password
         const pass = process.env.EMAIL_PASS || '';
         console.log('EMAIL_PASS:', pass.slice(0, 3) + '****' + pass.slice(-3), `(Length: ${pass.length})`);

         if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                  console.error('ERROR: EMAIL_USER or EMAIL_PASS is missing in .env');
                  return;
         }

         const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, '');

         const transporter = nodemailer.createTransport({
                  service: process.env.EMAIL_SERVICE || 'gmail',
                  auth: {
                           user: process.env.EMAIL_USER,
                           pass: cleanPass,
                  },
         });

         try {
                  console.log('Attempting to verify transporter connection...');
                  await transporter.verify();
                  console.log('✅ Connection verified successfully!');

                  console.log(`Sending test email to ${process.env.EMAIL_USER}...`);
                  const info = await transporter.sendMail({
                           from: process.env.EMAIL_USER,
                           to: process.env.EMAIL_USER, // Send to self
                           subject: 'Rent Wheels - Test Email',
                           text: 'This is a test email from the Vehicle Rental System to verify SMTP configuration.',
                           html: '<h3>Test Successful!</h3><p>Your email configuration is working correctly.</p>'
                  });

                  console.log('✅ Email sent successfully!');
                  console.log('Message ID:', info.messageId);
                  console.log('Response:', info.response);

         } catch (error) {
                  console.error('❌ Error Occurred:');
                  console.error(error);

                  if (error.code === 'EAUTH') {
                           console.log('\nPossible fixes:');
                           console.log('1. Check if EMAIL_USER matches the account you generated the App Password for.');
                           console.log('2. Generate a new App Password.');
                           console.log('3. Ensure 2-Step Verification is enabled on your Google Account.');
                  }
         }
};

testEmail();
