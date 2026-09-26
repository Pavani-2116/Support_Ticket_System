const request = require('supertest');
const app = require('../server');

describe('Auth', () => {
  it('rejects login with an invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('logs in successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects registration missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.statusCode).toBe(400);
  });
});
