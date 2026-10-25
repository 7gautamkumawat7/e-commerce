import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

let pgPool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isEmbedded = false;
let isInitialized = false;

export async function initDb(): Promise<void> {
  if (isInitialized) return;

  if (env.USE_EMBEDDED_POSTGRES || env.NODE_ENV === 'test') {
    logger.info('Initializing embedded in-memory PostgreSQL engine (PGlite)...');
    pgliteInstance = new PGlite();
    isEmbedded = true;
    await applyMigrations();
    isInitialized = true;
    return;
  }

  // Attempt real PostgreSQL connection pool
  try {
    pgPool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000
    });

    // Test connectivity
    const client = await pgPool.connect();
    client.release();
    isEmbedded = false;
    logger.info({ databaseUrl: env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') }, 'Connected to PostgreSQL database pool.');
    await applyMigrations();
    isInitialized = true;
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to connect to external PostgreSQL. Falling back to embedded PostgreSQL (PGlite)...');
    pgliteInstance = new PGlite();
    isEmbedded = true;
    await applyMigrations();
    isInitialized = true;
  }
}

export async function query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  if (!isInitialized) {
    await initDb();
  }

  if (isEmbedded && pgliteInstance) {
    const res = await pgliteInstance.query(text, params);
    return {
      rows: (res.rows || []) as T[],
      rowCount: res.affectedRows ?? (res.rows?.length || 0)
    };
  }

  if (pgPool) {
    const res = await pgPool.query(text, params);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? 0
    };
  }

  throw new Error('Database is not initialized.');
}

export async function transaction<T>(callback: (client: DbClient) => Promise<T>): Promise<T> {
  if (!isInitialized) {
    await initDb();
  }

  if (isEmbedded && pgliteInstance) {
    // PGlite transaction
    return await pgliteInstance.transaction(async (tx: any) => {
      const adapter: DbClient = {
        query: async <R = any>(text: string, params: any[] = []) => {
          const res = await tx.query(text, params);
          return {
            rows: (res.rows || []) as R[],
            rowCount: res.affectedRows ?? (res.rows?.length || 0)
          };
        }
      };
      return await callback(adapter);
    });
  }

  if (pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const adapter: DbClient = {
        query: async <R = any>(text: string, params: any[] = []) => {
          const res = await client.query(text, params);
          return {
            rows: res.rows as R[],
            rowCount: res.rowCount ?? 0
          };
        }
      };
      const result = await callback(adapter);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  throw new Error('Database is not initialized.');
}

export async function checkDbHealth(): Promise<{ status: 'connected' | 'disconnected'; engine: string; latencyMs: number }> {
  const start = Date.now();
  try {
    await query('SELECT 1');
    return {
      status: 'connected',
      engine: isEmbedded ? 'pglite-embedded' : 'postgresql-pool',
      latencyMs: Date.now() - start
    };
  } catch {
    return {
      status: 'disconnected',
      engine: isEmbedded ? 'pglite-embedded' : 'postgresql-pool',
      latencyMs: Date.now() - start
    };
  }
}

export async function closeDb(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
  if (pgliteInstance) {
    await pgliteInstance.close();
    pgliteInstance = null;
  }
  isInitialized = false;
}

export async function applyMigrations(): Promise<void> {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');

  // Split and execute statements or run script
  if (isEmbedded && pgliteInstance) {
    await pgliteInstance.exec(ddl);
  } else if (pgPool) {
    await pgPool.query(ddl);
  }
  logger.info('Database schema migrations applied successfully.');
}
