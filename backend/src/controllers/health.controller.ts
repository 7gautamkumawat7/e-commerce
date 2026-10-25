import { Request, Response } from 'express';
import { checkDbHealth } from '../db/connection.js';
import { redisService } from '../services/redis.service.js';

export class HealthController {
  async health(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      meta: { requestId: req.id }
    });
  }

  async readiness(req: Request, res: Response): Promise<void> {
    const dbHealth = await checkDbHealth();
    const redisHealth = await redisService.checkHealth();

    const isDbConnected = dbHealth.status === 'connected';
    // System is ready for requests if primary source of truth (PostgreSQL) is connected.
    // Redis degradation is supported gracefully.
    const isReady = isDbConnected;

    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'degraded',
      services: {
        postgres: dbHealth.status,
        redis: redisHealth.status
      },
      telemetry: {
        postgresEngine: dbHealth.engine,
        postgresLatencyMs: dbHealth.latencyMs,
        redisLatencyMs: redisHealth.latencyMs
      },
      timestamp: new Date().toISOString(),
      meta: { requestId: req.id }
    });
  }
}

export const healthController = new HealthController();
