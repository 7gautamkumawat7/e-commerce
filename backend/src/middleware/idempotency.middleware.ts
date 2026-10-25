import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { redisService } from '../services/redis.service.js';
import { idempotencyRepository } from '../repositories/idempotency.repository.js';
import { AppError } from '../types/api.js';
import { logger } from '../utils/logger.js';

interface StoredIdempotencyData {
  status: 'PROCESSING' | 'COMPLETED';
  responseStatus?: number;
  responseBody?: any;
  requestHash: string;
}

export function idempotencyMiddleware(options: { required?: boolean; ttlSeconds?: number } = {}) {
  const { required = false, ttlSeconds = 86400 } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string;

    if (!idempotencyKey) {
      if (required) {
        return next(
          new AppError(400, 'VALIDATION_ERROR', 'Idempotency-Key header is required for this operation.')
        );
      }
      return next();
    }

    const userId = req.user?.userId || 'guest';
    const endpoint = `${req.method}:${req.baseUrl + req.path}`;
    const redisKey = `idemp:${userId}:${endpoint}:${idempotencyKey}`;

    // Hash the request body to verify payload consistency
    const requestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(req.body || {}))
      .digest('hex');

    try {
      // 1. Check Redis cache first
      let cachedRaw = await redisService.get(redisKey);
      let record: StoredIdempotencyData | null = cachedRaw ? JSON.parse(cachedRaw) : null;

      // 2. If not in Redis, check DB fallback
      if (!record) {
        const dbRecord = await idempotencyRepository.find(idempotencyKey, userId, endpoint);
        if (dbRecord) {
          record = {
            status: dbRecord.status,
            responseStatus: dbRecord.response_status || undefined,
            responseBody: dbRecord.response_body,
            requestHash: dbRecord.request_hash
          };
        }
      }

      if (record) {
        // If still processing, notify client
        if (record.status === 'PROCESSING') {
          return next(
            new AppError(
              409,
              'IDEMPOTENCY_CONFLICT',
              'A request with this idempotency key is currently being processed. Please wait for completion.'
            )
          );
        }

        // If completed, return cached response
        if (record.status === 'COMPLETED') {
          logger.info(
            { idempotencyKey, endpoint, userId },
            'Idempotent request replayed from cache'
          );
          res.setHeader('X-Cache-Lookup', 'IDEMPOTENT_REPLAY');
          return res.status(record.responseStatus || 200).json(record.responseBody);
        }
      }

      // 3. Key is new: Reserve / acquire lock
      const lockAcquired = await redisService.setnx(
        redisKey,
        JSON.stringify({ status: 'PROCESSING', requestHash }),
        ttlSeconds
      );

      // Also reserve in PostgreSQL for persistence & fallback
      await idempotencyRepository.reserve(idempotencyKey, userId, endpoint, requestHash, ttlSeconds);

      if (!lockAcquired) {
        return next(
          new AppError(
            409,
            'IDEMPOTENCY_CONFLICT',
            'Concurrent request with the same idempotency key detected.'
          )
        );
      }

      // 4. Intercept response to store result
      const originalJson = res.json.bind(res);
      let capturedBody: any;

      res.json = (body: any) => {
        capturedBody = body;
        return originalJson(body);
      };

      res.on('finish', async () => {
        // Only cache 2xx and 4xx responses; do not cache 5xx server errors
        if (res.statusCode < 500 && capturedBody) {
          const completedData: StoredIdempotencyData = {
            status: 'COMPLETED',
            responseStatus: res.statusCode,
            responseBody: capturedBody,
            requestHash
          };

          await redisService.set(redisKey, JSON.stringify(completedData), ttlSeconds);
          await idempotencyRepository.complete(idempotencyKey, res.statusCode, capturedBody);
        } else if (res.statusCode >= 500) {
          // Release lock so client can retry cleanly
          await redisService.del(redisKey);
        }
      });

      next();
    } catch (err) {
      logger.error({ err, idempotencyKey }, 'Error in idempotency middleware');
      next();
    }
  };
}
