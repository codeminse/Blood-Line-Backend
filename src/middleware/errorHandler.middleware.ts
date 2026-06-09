import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    // Only capture server errors in Sentry — 4xx are expected
    if (err.statusCode >= 500) Sentry.captureException(err);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000 && mongoErr.keyPattern) {
    const field = Object.keys(mongoErr.keyPattern)[0] ?? 'field';
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      data: null,
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    res.status(400).json({ success: false, message, data: null });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid value for field: ${err.path}`,
      data: null,
    });
    return;
  }

  // Unknown 500 — always send to Sentry
  Sentry.captureException(err);
  console.error('[ErrorHandler] Unhandled error:', err);

  const isDev = env.NODE_ENV === 'development';
  const message = isDev && err instanceof Error ? err.message : 'Internal server error';

  res.status(500).json({ success: false, message, data: null });
};
