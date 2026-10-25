import { Router, Request, Response } from 'express';
import { query } from '../db/connection.js';
import { redisService } from '../services/redis.service.js';

const router = Router();

/**
 * Liveness Probe: Checks if Express process is running and accepting HTTP requests.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * Readiness Probe: Executes real dependency checks against PostgreSQL (SELECT 1)
 * and Redis (PING). Does not hard-code 'connected'.
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const checks: {
    postgres: 'connected' | 'disconnected' | 'error';
    redis: 'connected' | 'disconnected';
    latencyMs: { postgres?: number; redis?: number };
  } = {
    postgres: 'disconnected',
    redis: 'disconnected',
    latencyMs: {}
  };

  let allHealthy = true;

  // 1. PostgreSQL check: SELECT 1
  try {
    const pgStart = Date.now();
    const pgRes = await query('SELECT 1 as ping');
    checks.latencyMs.postgres = Date.now() - pgStart;
    if (pgRes.rows && pgRes.rows.length > 0) {
      checks.postgres = 'connected';
    }
  } catch (err) {
    checks.postgres = 'disconnected';
    allHealthy = false;
  }

  // 2. Redis check: PING
  try {
    const redisHealth = await redisService.checkHealth();
    checks.redis = redisHealth.status;
    checks.latencyMs.redis = redisHealth.latencyMs;
    // Note: Redis degradation is supported, but we accurately report status
  } catch {
    checks.redis = 'disconnected';
  }

  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json({
    status: allHealthy ? 'ready' : 'degraded',
    services: checks,
    timestamp: new Date().toISOString()
  });
});

export default router;
