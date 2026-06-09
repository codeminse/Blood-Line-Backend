import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, 'The requested resource was not found'));
};
