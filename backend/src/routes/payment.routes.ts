import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rate-limiter.middleware.js';
import { idempotencyMiddleware } from '../middleware/idempotency.middleware.js';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
  createRefundSchema
} from '../validators/index.js';

const router = Router();

const createOrderLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 20,
  keyPrefix: 'rl:pay:create'
});

const verifyLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 30,
  keyPrefix: 'rl:pay:verify'
});

router.use(requireAuth);

router.post(
  '/create-order',
  createOrderLimiter,
  idempotencyMiddleware({ required: false }),
  validateBody(createPaymentOrderSchema),
  paymentController.createOrder
);

router.post(
  '/verify',
  verifyLimiter,
  validateBody(verifyPaymentSchema),
  paymentController.verifyPayment
);

router.post(
  '/sandbox-simulate',
  verifyLimiter,
  paymentController.sandboxSimulate
);

router.post(
  '/:id/refund',
  idempotencyMiddleware({ required: false }),
  validateBody(createRefundSchema),
  paymentController.createRefund
);

router.get('/refunds', paymentController.getRefunds);

export default router;
