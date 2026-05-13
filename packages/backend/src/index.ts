import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { initDatabase, getDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import proposalRoutes from './routes/proposals';
import analyticsRoutes from './routes/analytics';
import metricsRoutes from './routes/metrics';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { responseEnvelope } from './middleware/responseEnvelope';
import { validatePagination } from './middleware/validatePagination';
import { correlationIdMiddleware, requestLoggingMiddleware } from './middleware/correlationId';
import { connectToQueue, startVoteConsumer } from './services/queueService';
import { logger } from './services/logger';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", config.FRONTEND_URL],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(correlationIdMiddleware);
app.use(requestLoggingMiddleware);
app.use('/api', validatePagination);
app.use(responseEnvelope);

async function initServices(): Promise<void> {
  try {
    initDatabase();
    logger.info('Database connected');

    await getRedisClient();
    logger.info('Redis connected');

    try {
      await connectToQueue();
      await startVoteConsumer();
      logger.info('RabbitMQ connected and vote consumer started');
    } catch (err) {
      logger.warn({ err }, 'RabbitMQ connection failed (optional)');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to initialize services');
  }
}

app.get('/api/health', async (_req: Request, res: Response) => {
  const services: Record<string, string> = {
    postgres: 'healthy',
    redis: 'healthy',
    rabbitmq: 'healthy',
  };

  try {
    const db = getDatabase();
    await db.raw('SELECT 1');
  } catch {
    services.postgres = 'unhealthy';
  }

  try {
    const redisClient = await getRedisClient();
    await redisClient.ping();
  } catch {
    services.redis = 'unhealthy';
  }

  res.json({
    status: Object.values(services).every(s => s === 'healthy') ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/metrics', metricsRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'CityHub API v1.0.0', version: '1.0.0' });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.PORT;

if (require.main === module) {
  initServices().then(() => {
    app.listen(PORT, () => {
      logger.info({ port: PORT, env: config.NODE_ENV }, 'Server started');
    });
  });
}

export default app;
