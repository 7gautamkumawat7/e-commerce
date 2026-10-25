import { initDb, closeDb } from './connection.js';
import { logger } from '../utils/logger.js';

async function main() {
  try {
    logger.info('Running database migrations...');
    await initDb();
    logger.info('Migrations completed successfully.');
  } catch (err) {
    logger.error({ err }, 'Migration failed.');
    process.exit(1);
  } finally {
    await closeDb();
  }
}

main();
