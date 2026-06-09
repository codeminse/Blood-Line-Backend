import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '../interfaces/common.interface';

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: PaginationMeta,
): void => {
  const response: ApiResponse<T> = { success: true, message, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string): void => {
  const response: ApiResponse<null> = { success: false, message, data: null };
  res.status(statusCode).json(response);
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
