import { Request, Response } from 'express';
import { ZodError, ZodError as ZodErrorType } from 'zod';
import type { ApiError } from '../types/express.d';
import { logger } from '../services/logger';

export function errorHandler(
  err: Error & Partial<ApiError>,
  req: Request,
  res: Response
): void {
  const statusCode = err.statusCode || 500;

  logger.error({
    correlationId: req.correlationId,
    statusCode,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  }, 'Request error');

  const errorName = err.constructor.name;

  if (errorName === 'ZodError' || err instanceof ZodError) {
    const zodErr = err as ZodError;
    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed',
      details: zodErr.errors.map((e: ZodErrorType['errors'][number]) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (errorName === 'SyntaxError' && err.message.includes('JSON')) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body',
    });
    return;
  }

  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
}

export function createError(message: string, statusCode: number): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  return error;
}