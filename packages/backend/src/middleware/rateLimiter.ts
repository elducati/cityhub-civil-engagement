import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { logger } from '../services/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

const defaultConfigs: Record<string, RateLimitConfig> = {
  auth: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'rl:auth' },
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'rl:api' },
  voting: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'rl:vote' },
};

export function rateLimiter(type: keyof typeof defaultConfigs = 'api') {
  const config = defaultConfigs[type];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = await getRedisClient();
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${config.keyPrefix}:${ip}`;

      const current = await client.incr(key);

      if (current === 1) {
        await client.expire(key, Math.ceil(config.windowMs / 1000));
      }

      if (current > config.maxRequests) {
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Max ${config.maxRequests} requests per ${config.windowMs / 1000} seconds`,
        });
        return;
      }

      res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current).toString());

      next();
    } catch (error) {
      logger.error({ error }, 'Rate limiter error');
      next();
    }
  };
}
