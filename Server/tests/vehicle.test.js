import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { generateToken } from '../utils/generateToken.js';

describe('Vehicle Endpoints', () => {
         let adminToken;
         let vehicleId;

         beforeEach(async () => {
                  // Create admin user
                  const admin = await User.create({
                           username: 'AdminUser',
                           email: 'admin@example.com',
                           password: 'password123',
                           role: 'admin'
                  });
                  adminToken = generateToken(admin._id);

                  // Create a vehicle
                  const vehicle = await Vehicle.create({
                           name: 'Test Vehicle',
                           brand: 'Toyota',
                           model: 'Corolla',
                           year: 2022,
                           type: 'car',
                           image: 'test.jpg',
                           pricePerDay: 1000,
                           fuelType: 'petrol',
                           transmission: 'manual',
                           seats: 5,
                           vehicleNumber: 'KA01AB1234',
                           description: 'A test vehicle',
                           location: 'Bangalore',
                           available: true
                  });
                  vehicleId = vehicle._id;
         });

         test('GET /api/vehicles - should fetch all vehicles', async () => {
                  const res = await request(app).get('/api/vehicles');
                  expect(res.statusCode).toEqual(200);
                  expect(Array.isArray(res.body)).toBeTruthy();
                  expect(res.body.length).toBeGreaterThan(0);
         });

         test('GET /api/vehicles/:id - should fetch a single vehicle', async () => {
                  const res = await request(app).get(`/api/vehicles/${vehicleId}`);
                  expect(res.statusCode).toEqual(200);
                  expect(res.body).toHaveProperty('_id');
                  expect(res.body.name).toEqual('Test Vehicle');
         });

         test('POST /api/vehicles - should allow admin to create vehicle', async () => {
                  const newVehicle = {
                           name: 'New Vehicle',
                           brand: 'Honda',
                           model: 'City',
                           year: 2023,
                           type: 'car',
                           image: 'bike.jpg',
                           pricePerDay: 500,
                           fuelType: 'petrol',
                           transmission: 'manual',
                           seats: 2,
                           vehicleNumber: 'KA02CD5678',
                           description: 'A new car',
                           location: 'Mumbai'
                  };

                  const res = await request(app)
                           .post('/api/vehicles')
                           .set('Authorization', `Bearer ${adminToken}`)
                           .send(newVehicle);

                  expect(res.statusCode).toEqual(201);
                  expect(res.body).toHaveProperty('name', 'New Vehicle');
         });
});
