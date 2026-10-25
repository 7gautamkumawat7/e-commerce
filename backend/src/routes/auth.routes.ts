import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rate-limiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
  addressSchema
} from '../validators/index.js';

const router = Router();

// Rate limiters for auth endpoints
const loginLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 10,
  keyPrefix: 'rl:auth:login'
});

const registerLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 5,
  keyPrefix: 'rl:auth:register'
});

const otpLimiter = createRateLimiter({
  windowSeconds: 60,
  maxRequests: 5,
  keyPrefix: 'rl:auth:otp'
});

router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/send-otp', otpLimiter, validateBody(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', otpLimiter, validateBody(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh', authController.refreshToken);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, validateBody(updateProfileSchema), authController.updateProfile);
router.post('/addresses', requireAuth, validateBody(addressSchema), authController.addAddress);
router.delete('/addresses/:id', requireAuth, authController.deleteAddress);

export default router;
