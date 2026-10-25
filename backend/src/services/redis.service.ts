import IORedis, { Redis as RedisClient } from 'ioredis';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const RedisConstructor = (IORedis as any).default || IORedis;

class RedisService {
  private client: RedisClient | null = null;
  private isConnected = false;
  private fallbackMemoryStore = new Map<string, { value: string; expiresAt: number }>();

  constructor() {
    this.init();
  }

  private init() {
    if (!env.REDIS_ENABLED) {
      logger.info('Redis is explicitly disabled via configuration; using in-memory fallback.');
      return;
    }

    try {
      this.client = new RedisConstructor(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy(times: number) {
          if (times > 3) {
            return null; // Stop retrying after 3 attempts; fall back gracefully
          }
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
        connectTimeout: 2000
      }) as RedisClient;

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Connected to Redis server.');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('error', (err: any) => {
        this.isConnected = false;
        logger.warn({ err: err?.message || err }, 'Redis connection error. Gracefully falling back to in-memory/DB store.');
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      // Attempt async connection without blocking initialization
      this.client.connect().catch((err: any) => {
        this.isConnected = false;
        logger.warn({ err: err?.message || err }, 'Redis initial connection failed. Operating in graceful degradation mode.');
      });
    } catch (err: any) {
      this.isConnected = false;
      logger.warn({ err: err?.message || err }, 'Could not initialize Redis client. Using fallback store.');
    }
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public async checkHealth(): Promise<{ status: 'connected' | 'disconnected'; latencyMs: number }> {
    const start = Date.now();
    if (!this.isConnected || !this.client) {
      return { status: 'disconnected', latencyMs: 0 };
    }
    try {
      const pong = await this.client.ping();
      return {
        status: pong === 'PONG' ? 'connected' : 'disconnected',
        latencyMs: Date.now() - start
      };
    } catch {
      return { status: 'disconnected', latencyMs: Date.now() - start };
    }
  }

  public async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        logger.warn({ key, err }, 'Redis GET failed, falling back to memory');
      }
    }

    // In-memory fallback
    const item = this.fallbackMemoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.fallbackMemoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        logger.warn({ key, err }, 'Redis SET failed, falling back to memory');
      }
    }

    // In-memory fallback
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : Date.now() + 86400 * 1000;
    this.fallbackMemoryStore.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        logger.warn({ key, err }, 'Redis DEL failed');
      }
    }
    this.fallbackMemoryStore.delete(key);
  }

  public async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        const val = await this.client.incr(key);
        if (ttlSeconds && val === 1) {
          await this.client.expire(key, ttlSeconds);
        }
        return val;
      } catch (err) {
        logger.warn({ key, err }, 'Redis INCR failed, using memory fallback');
      }
    }

    // In-memory fallback
    const now = Date.now();
    const existing = this.fallbackMemoryStore.get(key);
    let count = 1;
    let expiresAt = now + (ttlSeconds ? ttlSeconds * 1000 : 60000);

    if (existing && now < existing.expiresAt) {
      count = parseInt(existing.value, 10) + 1;
      expiresAt = existing.expiresAt;
    }

    this.fallbackMemoryStore.set(key, { value: count.toString(), expiresAt });
    return count;
  }

  public async setnx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (this.isConnected && this.client) {
      try {
        const res = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
        return res === 'OK';
      } catch (err) {
        logger.warn({ key, err }, 'Redis SETNX failed, using fallback');
      }
    }

    // In-memory fallback
    const now = Date.now();
    const existing = this.fallbackMemoryStore.get(key);
    if (existing && now < existing.expiresAt) {
      return false; // Key already exists
    }
    this.fallbackMemoryStore.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000
    });
    return true;
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
    this.isConnected = false;
    this.fallbackMemoryStore.clear();
  }
}

export const redisService = new RedisService();
