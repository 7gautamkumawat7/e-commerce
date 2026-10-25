import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function initMongoDb(): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info({ uri: env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@') }, 'Connected to MongoDB database.');
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      logger.error({ err: err?.message || err }, 'MongoDB connection error.');
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB connection lost. Reconnecting...');
    });

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
  } catch (err: any) {
    logger.warn(
      { err: err?.message || err },
      'MongoDB initial connection failed. Operating in fallback mode.'
    );
  }
}

export function isMongoHealthy(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function closeMongoDb(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB connection closed cleanly.');
  }
}
