import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const run = async () => {
         try {
                  const form = new FormData();
                  form.append('name', 'Kawasaki Ninja ZX-10R');
                  form.append('brand', 'Kawasaki');
                  form.append('model', 'Ninja ZX-10R');
                  form.append('pricePerDay', '1840');
                  form.append('engineCC', '998');
                  form.append('type', 'bike');
                  form.append('location', 'Railnagar , Rajkot');

                  // Simulate features array like frontend
                  form.append('features[]', 'ABS');
                  form.append('features[]', 'Traction Control');

                  // Simulate existing images (URLs)
                  form.append('images', 'https://example.com/image1.jpg');
                  form.append('images', 'https://example.com/image2.jpg');

                  // Headers
                  // Note: We need a valid token. Since I can't easily login, I might need to bypass auth or assume I can get a token?
                  // Wait, the route is protected: authenticatePartner.
                  // I need a valid token.
                  // I'll assume I can login as the partner first?
                  // Or I can temporarily disable auth in the route for testing? No, I shouldn't modify code just for test if I can avoid.
                  // I will try to login as a partner if I know credentials.
                  // If not, I can create a temp partner?

                  // Let's try to login with a known partner or admin?
                  // I see a 'check_user_docs.js' in the open files. Maybe I can find a user there.
                  // Instead of complex login, I will modify the route TEMPORARILY to log the error to console.log effectively or inspect logs.

                  // Actually, I can use the `inspectSpecificVehicle.js` to get the OwnerID.
                  // Then I can generate a token if I have the secret?
                  // JWT_SECRET is in .env.

                  console.log("This script requires a valid JWT token to work against the protected route.");
                  console.log("Skipping actual request. I will rely on code analysis for now.");

         } catch (error) {
                  console.error('Error:', error.response ? error.response.data : error.message);
         }
};

run();
