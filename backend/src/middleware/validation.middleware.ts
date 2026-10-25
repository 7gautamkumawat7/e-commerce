import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../types/api.js';

export function validateRequest(schemas: {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }));
        return next(
          new AppError(
            400,
            'VALIDATION_ERROR',
            issues.length > 0 ? issues[0].message : 'Invalid request payload',
            issues
          )
        );
      }
      next(err);
    }
  };
}

export function validateBody(schema: ZodSchema<any>) {
  return validateRequest({ body: schema });
}

export function validateQuery(schema: ZodSchema<any>) {
  return validateRequest({ query: schema });
}

export function validateParams(schema: ZodSchema<any>) {
  return validateRequest({ params: schema });
}
