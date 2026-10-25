import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDb, closeDb, query } from './db/connection.js';
import { initMongoDb, closeMongoDb } from './db/mongodb.js';
import { seedDatabase } from './db/seed.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    logger.info('Starting ShopCart Backend Service...');

    // 1. Initialize MongoDB Connection
    await initMongoDb();

    // 2. Initialize Relational Database & Run Migrations
    await initDb();

    // 3. Auto-seed if products table is empty
    try {
      const prodCount = await query<{ count: string }>('SELECT COUNT(*) as count FROM products');
      if (parseInt(prodCount.rows[0]?.count || '0', 10) === 0) {
        logger.info('Products table empty; executing initial seed data...');
        await seedDatabase();
      }
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Seed check encountered an issue; proceeding with startup.');
    }

    // 4. Create Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          apiDocs: `http://localhost:${env.PORT}/api-docs`,
          health: `http://localhost:${env.PORT}/health`,
          ready: `http://localhost:${env.PORT}/ready`
        },
        `🚀 ShopCart Payment & E-Commerce Backend listening on port ${env.PORT}`
      );
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Graceful shutdown signal received. Closing connections...');
      server.close(async () => {
        await closeMongoDb();
        await closeDb();
        logger.info('Server, MongoDB, and database pool closed cleanly. Process exiting.');
        process.exit(0);
      });

      // Force exit after 10s timeout
      setTimeout(() => {
        logger.error('Forced shutdown timeout reached.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    logger.fatal({ err: err.message, stack: err.stack }, 'Application failed to start.');
    process.exit(1);
  }
}

bootstrap();
