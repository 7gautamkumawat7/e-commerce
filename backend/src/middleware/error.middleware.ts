import { Request, Response, NextFunction } from 'express';
import { AppError, ApiErrorResponse } from '../types/api.js';
import { StateTransitionError } from '../types/states.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id || 'unknown';
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected internal error occurred.';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof StateTransitionError) {
    statusCode = 400;
    errorCode = 'INVALID_STATE_TRANSITION';
    message = err.message;
  } else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON body in request payload.';
  } else if (err.code === '23505') {
    // PostgreSQL Unique Violation
    statusCode = 409;
    errorCode = 'RESOURCE_ALREADY_EXISTS';
    message = 'A resource with these unique attributes already exists.';
    details = { constraint: err.constraint, detail: err.detail };
  } else if (err.code === '23503') {
    // PostgreSQL Foreign Key Violation
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_VIOLATION';
    message = 'Referenced related entity does not exist.';
  }

  // Log error with request correlation details
  if (statusCode >= 500) {
    logger.error(
      {
        requestId,
        url: req.originalUrl,
        method: req.method,
        statusCode,
        errorCode,
        err: err.message,
        stack: err.stack
      },
      'Unhandled Server Error'
    );
  } else {
    logger.warn(
      {
        requestId,
        url: req.originalUrl,
        method: req.method,
        statusCode,
        errorCode,
        message
      },
      'Client Error Handled'
    );
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
      ...(env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {})
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    },
    meta: {
      requestId: req.id,
      timestamp: new Date().toISOString()
    }
  });
}
