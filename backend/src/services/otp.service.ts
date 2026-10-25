import crypto from 'crypto';
import { redisService } from './redis.service.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../types/api.js';

export const OTP_TTL_SECONDS = 300; // 5 minutes time-limited
export const OTP_RATE_LIMIT_WINDOW = 600; // 10 minutes
export const OTP_MAX_ATTEMPTS = 3;

export class OtpService {
  /**
   * Generates a cryptographically secure 6-digit OTP, saves in Redis with a 5-minute TTL,
   * and enforces rate-limiting per email.
   */
  async generateOtp(email: string): Promise<{
    success: boolean;
    expiresInSeconds: number;
    devOtp?: string; // exposed in development/test for zero-friction verification
  }> {
    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitKey = `rl:otp:${normalizedEmail}`;
    const otpKey = `otp:${normalizedEmail}`;

    // 1. Check Rate Limiting in Redis
    const requestCount = await redisService.incr(rateLimitKey, OTP_RATE_LIMIT_WINDOW);
    if (requestCount > OTP_MAX_ATTEMPTS) {
      throw new AppError(
        429,
        'RATE_LIMIT_EXCEEDED',
        `Too many OTP requests. Please wait ${Math.ceil(OTP_RATE_LIMIT_WINDOW / 60)} minutes before requesting again.`
      );
    }

    // 2. Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Store OTP in Redis with Time Limit (TTL = 300 seconds)
    await redisService.set(otpKey, otp, OTP_TTL_SECONDS);

    logger.info(
      { email: normalizedEmail, otp, ttl: OTP_TTL_SECONDS },
      '🔐 Secure OTP generated and stored in Redis with 5-minute time limit.'
    );

    return {
      success: true,
      expiresInSeconds: OTP_TTL_SECONDS,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
  }

  /**
   * Verifies the submitted OTP against Redis.
   * If correct, deletes the OTP from Redis (one-time use) and returns true.
   */
  async verifyOtp(email: string, submittedOtp: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const otpKey = `otp:${normalizedEmail}`;

    const storedOtp = await redisService.get(otpKey);

    if (!storedOtp) {
      throw new AppError(
        400,
        'OTP_EXPIRED',
        'Verification OTP has expired or was not requested. Please request a new one.'
      );
    }

    if (storedOtp.trim() !== submittedOtp.trim()) {
      throw new AppError(
        400,
        'INVALID_OTP',
        'The verification code you entered is incorrect. Please try again.'
      );
    }

    // Delete once verified to prevent replay attacks
    await redisService.del(otpKey);
    logger.info({ email: normalizedEmail }, '✅ OTP verified successfully in Redis.');
    return true;
  }
}

export const otpService = new OtpService();
