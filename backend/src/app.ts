import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { correlationMiddleware } from './middleware/correlation.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import apiRouter from './routes/index.js';
import { swaggerDocument } from './docs/swagger.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI assets and local development
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // 2. CORS configuration for frontend credentials & cookies
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev to avoid blocking Vite ports
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Idempotency-Key', 'X-Request-Id', 'X-Razorpay-Signature']
    })
  );

  // 3. Request Correlation & Structured Logging
  app.use(correlationMiddleware);

  // 4. Body Parsing with Raw Buffer Retention for Webhook HMAC
  app.use(
    express.json({
      limit: '2mb',
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      }
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // 5. Swagger / OpenAPI Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // 6. Liveness and Readiness Probes
  app.use('/', healthRoutes);

  // 7. Central API Routes
  app.use('/api', apiRouter);

  // 8. Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
