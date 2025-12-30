import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Auth Endpoints', () => {
         const testUser = {
                  username: 'TestUser',
                  email: 'test@example.com',
                  password: 'password123',
                  phone: '1234567890'
         };

         test('POST /api/auth/register - should register a new user', async () => {
                  const res = await request(app)
                           .post('/api/auth/register')
                           .send(testUser);

                  expect(res.statusCode).toEqual(201);
                  expect(res.body).toHaveProperty('token');
                  expect(res.body.user).toHaveProperty('email', testUser.email);
         });

         test('POST /api/auth/login - should login existing user', async () => {
                  // Register first (or seed) - but we relying on afterEach cleanup so we register again
                  await request(app).post('/api/auth/register').send(testUser);

                  const res = await request(app)
                           .post('/api/auth/login')
                           .send({
                                    email: testUser.email,
                                    password: testUser.password
                           });

                  expect(res.statusCode).toEqual(200);
                  expect(res.body).toHaveProperty('token');
         });

         test('POST /api/auth/login - should fail with wrong password', async () => {
                  await request(app).post('/api/auth/register').send(testUser);

                  const res = await request(app)
                           .post('/api/auth/login')
                           .send({
                                    email: testUser.email,
                                    password: 'wrongpassword'
                           });

                  expect(res.statusCode).toEqual(401); // Or 401 depending on implementation
         });
});
