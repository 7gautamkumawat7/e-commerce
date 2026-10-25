import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined,
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'password',
      'passwordHash',
      'secret',
      'razorpay_secret',
      'razorpaySignature',
      'card.cvv',
      'card.number',
      'cvv',
      'cardNumber'
    ],
    censor: '[REDACTED]'
  },
  base: {
    service: 'shopcart-api',
    env: env.NODE_ENV
  }
});

export type Logger = typeof logger;
