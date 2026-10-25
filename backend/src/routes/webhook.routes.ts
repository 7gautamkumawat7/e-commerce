import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller.js';
import { createRateLimiter } from '../middleware/rate-limiter.middleware.js';

const router = Router();

const webhookLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 120,
  keyPrefix: 'rl:webhook:razorpay'
});

router.post('/razorpay', webhookLimiter, webhookController.handleRazorpayWebhook);

export default router;
