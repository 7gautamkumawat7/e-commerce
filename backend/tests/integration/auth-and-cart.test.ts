import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { initDb, closeDb } from '../../src/db/connection.js';
import { seedDatabase } from '../../src/db/seed.js';

describe('Auth & Cart API Integration Tests', () => {
  const app = createApp();
  let authCookie: string;
  let testUserEmail = `test_${Date.now()}@shopcart.dev`;

  beforeAll(async () => {
    process.env.USE_EMBEDDED_POSTGRES = 'true';
    await initDb();
    await seedDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register creates user and returns HTTP-only cookies', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: testUserEmail,
          password: 'TestPassword123!',
          phone: '+91 9988776655'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUserEmail);
      expect(res.body.data.accessToken).toBeDefined();

      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c: string) => c.includes('access_token='))).toBe(true);
      authCookie = cookies.find((c: string) => c.includes('access_token=')) || '';
    });

    it('POST /api/auth/register rejects duplicate email address with 409', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Person',
          email: testUserEmail,
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
    });

    it('POST /api/auth/login authenticates registered user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUserEmail);
    });

    it('POST /api/auth/login rejects incorrect password with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword999'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('GET /api/cart rejects unauthenticated request with 401 AUTH_REQUIRED', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('GET /api/auth/me returns profile for authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testUserEmail);
      expect(res.body.data.addresses.length).toBeGreaterThan(0);
    });
  });

  describe('Authoritative Server-Side Cart Endpoints', () => {
    it('POST /api/cart/items adds product and updates totals', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', authCookie)
        .send({
          productId: 'elec-1',
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].product_id).toBe('elec-1');
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.subtotalCents).toBe(499900 * 2);
    });

    it('POST /api/cart/items rejects adding quantity exceeding available inventory', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', authCookie)
        .send({
          productId: 'elec-1',
          quantity: 999999 // Exceeds available stock
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('OUT_OF_STOCK');
    });

    it('PATCH /api/cart/items/:productId updates item quantity', async () => {
      const res = await request(app)
        .patch('/api/cart/items/elec-1')
        .set('Cookie', authCookie)
        .send({ quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(1);
      expect(res.body.data.subtotalCents).toBe(499900);
    });

    it('DELETE /api/cart/items/:productId removes item from cart', async () => {
      const res = await request(app)
        .delete('/api/cart/items/elec-1')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(0);
      expect(res.body.data.subtotalCents).toBe(0);
    });
  });
});
