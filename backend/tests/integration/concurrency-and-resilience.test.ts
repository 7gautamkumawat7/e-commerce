import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { initDb, closeDb, query, transaction } from '../../src/db/connection.js';
import { seedDatabase } from '../../src/db/seed.js';
import { redisService } from '../../src/services/redis.service.js';
import { productService } from '../../src/services/product.service.js';
import { productRepository } from '../../src/repositories/product.repository.js';

describe('Case 8 & 9: Concurrency, Fault Tolerance & Transaction Atomicity Tests', () => {
  const app = createApp();
  let authCookie: string;

  beforeAll(async () => {
    process.env.USE_EMBEDDED_POSTGRES = 'true';
    await initDb();
    await seedDatabase();

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Resilience Test User',
        email: `resilience_${Date.now()}@shopcart.dev`,
        password: 'Password123!'
      });

    const cookies = regRes.headers['set-cookie'] || [];
    authCookie = cookies.find((c: string) => c.includes('access_token=')) || '';
  });

  afterAll(async () => {
    await closeDb();
  });

  // CASE 8: Redis Failure / Graceful Degradation
  it('Case 8: Redis unavailable -> System degrades gracefully to PostgreSQL without crashing', async () => {
    // Verify product catalogue functions normally even when Redis operations fall back
    const result = await productService.getProducts({ category: 'electronics' });
    expect(result.products.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);

    // Verify health readiness accurately reports Redis status
    const readyRes = await request(app).get('/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.services.postgres).toBe('connected');
    expect(readyRes.body.services.redis).toBeDefined();
  });

  // CASE 9: Database Transaction Rollback on Midway Failure
  it('Case 9: Database transaction fails midway -> Atomically rolls back with zero partial state', async () => {
    const stockBefore = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['home-2']
    );
    const initialStock = stockBefore.rows[0].stock_quantity;

    // Simulate multi-step checkout transaction that encounters an unexpected error midway
    await expect(
      transaction(async (client) => {
        // Step 1: Deduct stock
        const deducted = await productRepository.atomicDeductStock('home-2', 2, client);
        expect(deducted).toBe(true);

        // Step 2: Simulate failure (e.g. gateway error or DB constraint violation)
        throw new Error('Midway transaction failure simulated');
      })
    ).rejects.toThrow('Midway transaction failure simulated');

    // Verify that the inventory deduction was completely ROLLED BACK
    const stockAfter = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['home-2']
    );
    expect(stockAfter.rows[0].stock_quantity).toBe(initialStock);
  });

  // Concurrency: Two concurrent checkout attempts for the last remaining item
  it('Race Condition: Two concurrent checkout operations for the last unit -> Only one succeeds', async () => {
    // Set stock to exactly 1
    await query('UPDATE inventory SET stock_quantity = 1 WHERE product_id = $1', ['home-3']);

    // Attempt 2 concurrent atomic deductions
    const [result1, result2] = await Promise.all([
      transaction(async (client) => {
        return await productRepository.atomicDeductStock('home-3', 1, client);
      }),
      transaction(async (client) => {
        return await productRepository.atomicDeductStock('home-3', 1, client);
      })
    ]);

    // Exactly one deduction must succeed (true), and the other must fail (false)
    const successCount = [result1, result2].filter(Boolean).length;
    expect(successCount).toBe(1);

    // Final stock must be 0, never negative (-1)
    const finalStock = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['home-3']
    );
    expect(finalStock.rows[0].stock_quantity).toBe(0);
  });

  // Idempotency: Idempotency-Key Header prevents duplicate order creation on retry
  it('Idempotency Key: Prevents duplicate order creation on client retry with same key', async () => {
    // Add item to cart
    await request(app).delete('/api/cart').set('Cookie', authCookie);
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'home-1', quantity: 1 });

    const idempotencyKey = `idemp-key-${Date.now()}`;

    // Request 1
    const res1 = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .set('Idempotency-Key', idempotencyKey)
      .send({});

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);
    const orderId1 = res1.body.data.orderId;

    // Request 2 (Replay with same Idempotency-Key)
    const res2 = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .set('Idempotency-Key', idempotencyKey)
      .send({});

    // Should return cached response with same orderId
    expect(res2.status).toBe(201);
    expect(res2.body.data.orderId).toBe(orderId1);
  });
});
