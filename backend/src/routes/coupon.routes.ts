import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rate-limiter.middleware.js';
import { applyCouponSchema } from '../validators/index.js';

const router = Router();

const couponLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 15,
  keyPrefix: 'rl:coupons:apply'
});

router.post(
  '/apply',
  requireAuth,
  couponLimiter,
  validateBody(applyCouponSchema),
  couponController.applyCoupon
);

export default router;
