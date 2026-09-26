const request = require('supertest');
const app = require('../server');

let customerToken, agentToken, ticketId;

beforeAll(async () => {
  const c = await request(app).post('/api/auth/login').send({ email: 'customer@example.com', password: 'password123' });
  customerToken = c.body.token;
  const a = await request(app).post('/api/auth/login').send({ email: 'agent@example.com', password: 'password123' });
  agentToken = a.body.token;
});

describe('Tickets', () => {
  it('rejects unauthenticated access to /api/tickets', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.statusCode).toBe(401);
  });

  it('allows a customer to create a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ subject: 'Test ticket', description: 'Something is broken', priority: 'low' });
    expect(res.statusCode).toBe(201);
    ticketId = res.body.id;
  });

  it('allows an agent to update ticket status', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'in_progress' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('forbids a customer from updating ticket status (agent-only route)', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'closed' });
    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for a non-existent ticket', async () => {
    const res = await request(app)
      .get('/api/tickets/999999')
      .set('Authorization', `Bearer ${agentToken}`);
    expect(res.statusCode).toBe(404);
  });
});
