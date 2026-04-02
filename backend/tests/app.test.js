const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/prisma');

describe('API Health and Auth Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET / should return health check', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Finance Dashboard API is running');
  });

  let userToken = '';

  test('POST /api/users/register should create a user', async () => {
    // Generate a uniquely verifiable email for the test
    const testEmail = `test_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test Viewer',
        email: testEmail,
        password: 'password123',
        role: 'Viewer'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
  });

  test('GET /api/users/me should return current user', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('Viewer');
  });

  test('POST /api/records should fail for Viewer', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 100,
        type: 'Income',
        category: 'Test'
      });
    
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });
});
