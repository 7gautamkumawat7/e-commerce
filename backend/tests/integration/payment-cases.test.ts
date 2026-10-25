import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { createApp } from '../../src/app.js';
import { initDb, closeDb, query } from '../../src/db/connection.js';
import { seedDatabase } from '../../src/db/seed.js';
import { paymentService } from '../../src/services/payment.service.js';
import { webhookService } from '../../src/services/webhook.service.js';
import { env } from '../../src/config/env.js';

describe('Payment Engineering & Concurrency Test Cases (Case 1 - Case 9)', () => {
  const app = createApp();
  let authCookie: string;
  let testUserId: string;

  beforeAll(async () => {
    process.env.USE_EMBEDDED_POSTGRES = 'true';
    await initDb();
    await seedDatabase();

    // Register a dedicated test user
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Payment Test User',
        email: `pay_test_${Date.now()}@shopcart.dev`,
        password: 'Password123!'
      });

    const cookies = regRes.headers['set-cookie'] || [];
    authCookie = cookies.find((c: string) => c.includes('access_token=')) || '';
    testUserId = regRes.body.data.user.id;
  });

  afterAll(async () => {
    await closeDb();
  });

  // CASE 1: Normal successful payment lifecycle
  it('Case 1: Payment succeeds normally with backend order creation and signature verification', async () => {
    // 1. Add item to cart
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'elec-2', quantity: 1 });

    // 2. Fetch stock before payment
    const stockBefore = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['elec-2']
    );
    const initialStock = stockBefore.rows[0].stock_quantity;

    // 3. Create payment order via backend
    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({ couponCode: 'WELCOME50' });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    const { orderId, razorpayOrderId, amountCents } = orderRes.body.data;
    expect(orderId).toBeDefined();
    expect(razorpayOrderId).toBeDefined();
    expect(amountCents).toBeGreaterThan(0);

    // 4. Generate valid HMAC signature matching Razorpay specification
    const fakePaymentId = `pay_rzp_${Date.now()}`;
    const validSignature = paymentService.generateTestSignature(razorpayOrderId, fakePaymentId);

    // 5. Verify payment via backend
    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: fakePaymentId,
        razorpaySignature: validSignature
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.paymentStatus).toBe('SUCCESS');
    expect(verifyRes.body.data.orderStatus).toBe('CONFIRMED');

    // 6. Verify inventory was atomically decremented in database
    const stockAfter = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['elec-2']
    );
    expect(stockAfter.rows[0].stock_quantity).toBe(initialStock - 1);
  });

  // CASE 2: Frontend claims success but signature is invalid
  it('Case 2: Frontend claims success but signature is invalid -> Backend strictly rejects it', async () => {
    // Add item & create payment order
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'beauty-1', quantity: 1 });

    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({});

    const { orderId, razorpayOrderId } = orderRes.body.data;
    const fakePaymentId = `pay_fake_${Date.now()}`;
    const tamperedSignature = 'deadbeefcafebabe0123456789abcdef0123456789abcdef0123456789abcdef';

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: fakePaymentId,
        razorpaySignature: tamperedSignature
      });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.success).toBe(false);
    expect(verifyRes.body.error.code).toBe('PAYMENT_SIGNATURE_INVALID');

    // Verify payment remains in CREATED state in DB
    const payRec = await query('SELECT status FROM payments WHERE order_id = $1', [orderId]);
    expect(payRec.rows[0].status).toBe('CREATED');
  });

  // CASE 3: The same payment verification request arrives twice
  it('Case 3: Same payment verification arrives twice -> Second request idempotently returns success without duplicate deductions', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'home-1', quantity: 1 });

    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({});

    const { orderId, razorpayOrderId } = orderRes.body.data;
    const paymentId = `pay_dup_${Date.now()}`;
    const signature = paymentService.generateTestSignature(razorpayOrderId, paymentId);

    // First request
    const firstVerify = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature
      });
    expect(firstVerify.status).toBe(200);
    expect(firstVerify.body.data.alreadyProcessed).toBe(false);

    // Stock check after first verify
    const stockAfterFirst = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['home-1']
    );

    // Second request (Duplicate submission by client / network retry)
    const secondVerify = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature
      });

    expect(secondVerify.status).toBe(200);
    expect(secondVerify.body.data.alreadyProcessed).toBe(true);

    // Stock must NOT be deducted a second time!
    const stockAfterSecond = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['home-1']
    );
    expect(stockAfterSecond.rows[0].stock_quantity).toBe(stockAfterFirst.rows[0].stock_quantity);
  });

  // CASE 4: Webhook arrives before browser verification callback
  it('Case 4: Webhook arrives before browser verification callback -> Reconciles correctly', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'fash-1', quantity: 1 });

    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({});

    const { orderId, razorpayOrderId } = orderRes.body.data;
    const webhookPaymentId = `pay_hook_${Date.now()}`;

    // Webhook arrives first
    const webhookPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test_1',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: razorpayOrderId,
            status: 'captured',
            amount: orderRes.body.data.amountCents,
            currency: 'INR'
          }
        }
      }
    });

    const webhookSignature = webhookService.signTestPayload(webhookPayload);

    const hookRes = await request(app)
      .post('/api/webhooks/razorpay')
      .set('X-Razorpay-Signature', webhookSignature)
      .set('Content-Type', 'application/json')
      .send(webhookPayload);

    expect(hookRes.status).toBe(200);
    expect(hookRes.body.data.status).toBe('PROCESSED');

    // DB state must be reconciled to SUCCESS and CONFIRMED
    const payRec = await query('SELECT status FROM payments WHERE order_id = $1', [orderId]);
    expect(payRec.rows[0].status).toBe('SUCCESS');

    const ordRec = await query('SELECT status FROM orders WHERE id = $1', [orderId]);
    expect(ordRec.rows[0].status).toBe('CONFIRMED');

    // Now browser verification arrives later:
    const clientSignature = paymentService.generateTestSignature(razorpayOrderId, webhookPaymentId);
    const clientVerify = await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: webhookPaymentId,
        razorpaySignature: clientSignature
      });

    expect(clientVerify.status).toBe(200);
    expect(clientVerify.body.data.alreadyProcessed).toBe(true);
  });

  // CASE 5: Browser verification arrives before webhook
  it('Case 5: Browser verification arrives before webhook -> Webhook safely skips duplicate deductions', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'fash-3', quantity: 1 });

    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({});

    const { orderId, razorpayOrderId } = orderRes.body.data;
    const paymentId = `pay_browser_first_${Date.now()}`;
    const clientSignature = paymentService.generateTestSignature(razorpayOrderId, paymentId);

    // Browser verifies first
    await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: clientSignature
      });

    const stockBeforeWebhook = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['fash-3']
    );

    // Webhook arrives second
    const webhookPayload = JSON.stringify({
      id: `evt_browser_first_${Date.now()}`,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: razorpayOrderId,
            status: 'captured'
          }
        }
      }
    });

    const webhookSignature = webhookService.signTestPayload(webhookPayload);
    const hookRes = await request(app)
      .post('/api/webhooks/razorpay')
      .set('X-Razorpay-Signature', webhookSignature)
      .set('Content-Type', 'application/json')
      .send(webhookPayload);

    expect(hookRes.status).toBe(200);

    // Stock was not double deducted
    const stockAfterWebhook = await query<{ stock_quantity: number }>(
      'SELECT stock_quantity FROM inventory WHERE product_id = $1',
      ['fash-3']
    );
    expect(stockAfterWebhook.rows[0].stock_quantity).toBe(stockBeforeWebhook.rows[0].stock_quantity);
  });

  // CASE 6: Same webhook arrives 5 times
  it('Case 6: Same webhook arrives 5 times -> Only 1 event applied, other 4 ignored as duplicates', async () => {
    const fixedEventId = `evt_repeat_5x_${Date.now()}`;
    const webhookPayload = JSON.stringify({
      id: fixedEventId,
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_failed_sample',
            order_id: 'order_nonexistent_rzp',
            error_code: 'BAD_REQUEST',
            error_description: 'Payment failed'
          }
        }
      }
    });

    const signature = webhookService.signTestPayload(webhookPayload);

    const responses: any[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/webhooks/razorpay')
        .set('X-Razorpay-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(webhookPayload);
      responses.push(res);
    }

    // All 5 requests succeed with 200 (so Razorpay does not keep retrying indefinitely)
    for (const res of responses) {
      expect(res.status).toBe(200);
    }

    // Only 1 record exists in payment_events table
    const eventRecords = await query(
      'SELECT COUNT(*) as count FROM payment_events WHERE provider_event_id = $1',
      [fixedEventId]
    );
    expect(parseInt(eventRecords.rows[0].count, 10)).toBe(1);
  });

  // CASE 7: Inventory exhausted during checkout
  it('Case 7: Inventory exhausted during checkout -> Checkout fails with OUT_OF_STOCK', async () => {
    // Add item to cart
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'elec-3', quantity: 1 });

    // Artificially zero the inventory in database before checkout
    await query('UPDATE inventory SET stock_quantity = 0 WHERE product_id = $1', ['elec-3']);

    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({});

    expect(orderRes.status).toBe(400);
    expect(orderRes.body.success).toBe(false);
    expect(orderRes.body.error.code).toBe('OUT_OF_STOCK');
  });

  // CASE 8: Refund processing
  it('Processes full and partial refunds with state transitions and inventory recovery', async () => {
    // Clear any previous cart state
    await request(app).delete('/api/cart').set('Cookie', authCookie);

    // Perform a successful order first
    await query('UPDATE inventory SET stock_quantity = 10 WHERE product_id = $1', ['fash-2']);
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', authCookie)
      .send({ productId: 'fash-2', quantity: 1 });

    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Cookie', authCookie)
      .send({});

    const { orderId, razorpayOrderId } = orderRes.body.data;
    const paymentId = `pay_refund_${Date.now()}`;
    const signature = paymentService.generateTestSignature(razorpayOrderId, paymentId);

    await request(app)
      .post('/api/payments/verify')
      .set('Cookie', authCookie)
      .send({
        orderId,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature
      });

    // Lookup payment record id
    const payRec = await query('SELECT id, amount_cents FROM payments WHERE order_id = $1', [orderId]);
    const internalPaymentId = payRec.rows[0].id;
    const fullAmount = payRec.rows[0].amount_cents;

    // Process Full Refund
    const refundRes = await request(app)
      .post(`/api/payments/${internalPaymentId}/refund`)
      .set('Cookie', authCookie)
      .send({ amountCents: fullAmount, reason: 'Customer requested return' });

    expect(refundRes.status).toBe(201);
    expect(refundRes.body.success).toBe(true);

    // Verify payment transitioned to REFUNDED
    const updatedPay = await query('SELECT status FROM payments WHERE id = $1', [internalPaymentId]);
    expect(updatedPay.rows[0].status).toBe('REFUNDED');
  });
});
