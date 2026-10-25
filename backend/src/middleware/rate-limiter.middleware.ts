import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service.js';
import { AppError } from '../types/api.js';

export function createRateLimiter(options: {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
  skipFailedRequests?: boolean;
}) {
  const { windowSeconds, maxRequests, keyPrefix = 'rl' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Determine client identifier: authenticated user ID or remote IP
    const clientId = req.user?.userId || req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${req.baseUrl + req.path}:${clientId}`;

    try {
      const currentCount = await redisService.incr(key, windowSeconds);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount));

      if (currentCount > maxRequests) {
        res.setHeader('Retry-After', windowSeconds);
        return next(
          new AppError(
            429,
            'RATE_LIMIT_EXCEEDED',
            `Too many requests. Limit is ${maxRequests} requests per ${windowSeconds}s. Please retry shortly.`
          )
        );
      }

      next();
    } catch {
      // If rate limiter fails internally, fail open to avoid rejecting valid traffic
      next();
    }
  };
}
