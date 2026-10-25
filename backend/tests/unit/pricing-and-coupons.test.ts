import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { couponService } from '../../src/services/coupon.service.js';
import { initDb, closeDb } from '../../src/db/connection.js';
import { seedDatabase } from '../../src/db/seed.js';

describe('Pricing & Coupon Security Unit Tests', () => {
  beforeAll(async () => {
    process.env.USE_EMBEDDED_POSTGRES = 'true';
    await initDb();
    await seedDatabase();
  });

  afterAll(async () => {
    await closeDb();
  });

  it('calculates 20% discount correctly when order exceeds minimum threshold', async () => {
    // SUMMER20: 20% off, min order ₹499 (49900 cents), max discount ₹1000 (100000 cents)
    const subtotalCents = 200000; // ₹2,000
    const result = await couponService.validateAndCalculateDiscount('SUMMER20', 'usr_test_1', subtotalCents);

    expect(result.discountCents).toBe(40000); // 20% of 200000 = 40000 (₹400)
    expect(result.coupon.code).toBe('SUMMER20');
  });

  it('caps discount at maximum discount amount', async () => {
    // SUMMER20 max discount is 100000 cents (₹1,000)
    const subtotalCents = 1000000; // ₹10,000 (20% would be ₹2,000)
    const result = await couponService.validateAndCalculateDiscount('SUMMER20', 'usr_test_1', subtotalCents);

    expect(result.discountCents).toBe(100000); // Capped at ₹1,000
  });

  it('rejects coupon when order subtotal is below minimum order amount', async () => {
    const subtotalCents = 20000; // ₹200 (below ₹499 threshold)
    await expect(
      couponService.validateAndCalculateDiscount('SUMMER20', 'usr_test_1', subtotalCents)
    ).rejects.toThrow(/Minimum order amount/);
  });

  it('rejects expired coupons server-side', async () => {
    // EXPIRED20 is seeded with valid_until in the past
    await expect(
      couponService.validateAndCalculateDiscount('EXPIRED20', 'usr_test_1', 100000)
    ).rejects.toThrow(/expired/i);
  });

  it('rejects unknown or invalid coupon codes', async () => {
    await expect(
      couponService.validateAndCalculateDiscount('FAKE99', 'usr_test_1', 100000)
    ).rejects.toThrow(/invalid or inactive/i);
  });
});
