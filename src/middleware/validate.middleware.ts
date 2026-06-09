import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, target: ValidateTarget = 'body'): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new ApiError(400, message));
      } else {
        next(err);
      }
    }
  };
