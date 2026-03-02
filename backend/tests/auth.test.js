
const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());
const authRoutes = require('../src/routes/auth');
app.use('/api/auth', authRoutes);

describe('Auth routes (smoke)', () => {
  test('register missing fields returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.statusCode).toBe(400);
  });
});
