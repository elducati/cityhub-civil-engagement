import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_SSL: z.coerce.boolean().default(false),
  REDIS_URL: z.string().min(1),
  RABBITMQ_URL: z.string().min(1),
  AUTH_JWT_SECRET: z.string().min(32),
  AUTH_JWT_EXPIRY: z.string().default('1h'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Environment validation failed:', result.error.format());
  process.exit(1);
}

export const config = result.data;

export type Config = typeof config;