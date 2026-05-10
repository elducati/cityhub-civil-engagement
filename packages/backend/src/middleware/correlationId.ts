import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

declare global {
  interface Request {
    correlationId?: string;
    startTime?: number;
  }
}

export function correlationIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || generateCorrelationId();
  req.correlationId = correlationId;
  req.startTime = Date.now();
  next();
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      correlationId: req.correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    }, 'http request');
  });

  next();
}
