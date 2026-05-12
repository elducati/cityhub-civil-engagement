import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

const MAX_PAGE = 1000;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

declare global {
  namespace Express {
    interface Request {
      safeQuery: {
        page: number;
        limit: number;
      };
    }
  }
}

export function validatePagination(req: Request, _res: Response, next: NextFunction): void {
  const rawPage = parseInt(req.query.page as string, 10);
  const rawLimit = parseInt(req.query.limit as string, 10);

  let page = Number.isFinite(rawPage) ? rawPage : 1;
  let limit = Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT;

  if (page < 1) {
    logger.warn({ original: req.query.page, corrected: 1 }, 'Pagination page clamped to minimum');
    page = 1;
  }
  if (page > MAX_PAGE) {
    logger.warn({ original: req.query.page, corrected: MAX_PAGE }, 'Pagination page clamped to maximum');
    page = MAX_PAGE;
  }
  if (limit < 1) {
    limit = 1;
  }
  if (limit > MAX_LIMIT) {
    logger.warn({ original: req.query.limit, corrected: MAX_LIMIT }, 'Pagination limit clamped to maximum');
    limit = MAX_LIMIT;
  }

  req.safeQuery = { page, limit };
  next();
}
