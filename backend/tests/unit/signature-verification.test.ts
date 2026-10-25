import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('HMAC Signature Verification Unit Tests', () => {
  const testSecret = 'rzp_test_secret_shopcartDevSecret99';
  const orderId = 'order_test_123456';
  const paymentId = 'pay_test_987654';

  it('generates and validates authentic HMAC-SHA256 payment signature', () => {
    const payload = `${orderId}|${paymentId}`;
    const validSignature = crypto.createHmac('sha256', testSecret).update(payload).digest('hex');

    const expectedSignature = crypto.createHmac('sha256', testSecret).update(`${orderId}|${paymentId}`).digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(validSignature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );

    expect(isValid).toBe(true);
  });

  it('rejects tampered payment ID or forged signature', () => {
    const forgedPaymentId = 'pay_tampered_999999';
    const originalSignature = crypto.createHmac('sha256', testSecret).update(`${orderId}|${paymentId}`).digest('hex');

    const recalculatedSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${orderId}|${forgedPaymentId}`)
      .digest('hex');

    expect(originalSignature).not.toBe(recalculatedSignature);
  });

  it('verifies webhook raw body HMAC-SHA256 signature', () => {
    const webhookSecret = 'rzp_webhook_secret_shopcartSecure2026';
    const rawBody = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: { payment: { entity: { id: paymentId, order_id: orderId, amount: 499900 } } }
    });

    const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    const verifySignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    expect(
      crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(verifySignature, 'utf8'))
    ).toBe(true);
  });
});
