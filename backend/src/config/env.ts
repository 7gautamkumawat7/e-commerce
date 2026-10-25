import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root or parent repo root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/shopcart'),
  USE_EMBEDDED_POSTGRES: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  // MongoDB Database Configuration
  MONGODB_URI: z.string().default('mongodb://localhost:27017/shopcart'),

  // Redis In-Memory Store
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_ENABLED: z
    .string()
    .optional()
    .transform((val) => val !== 'false' && val !== '0')
    .default('true'),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(16).default('shopcart_development_access_secret_super_secure_jwt_key_2026!'),
  JWT_REFRESH_SECRET: z.string().min(16).default('shopcart_development_refresh_secret_super_secure_jwt_key_2026!'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Razorpay Gateway
  RAZORPAY_KEY_ID: z.string().default('rzp_test_shopcartDevKey01'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_secret_shopcartDevSecret99'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret_shopcartSecure2026'),

  // Security & Client URLs
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ CRITICAL ENVIRONMENT CONFIGURATION ERROR:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsed.success
  ? parsed.data
  : envSchema.parse({
      NODE_ENV: 'development',
      PORT: 5000,
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/shopcart',
      REDIS_URL: 'redis://localhost:6379'
    });

export type Env = z.infer<typeof envSchema>;
