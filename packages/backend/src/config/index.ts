import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  SOCKET_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  REDIS_URL: z.string().min(1),
  RABBITMQ_URL: z.string().min(1),
  AUTH_JWT_SECRET: z.string().min(32),
  AUTH_JWT_EXPIRY: z.string().default('1h'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(
    `Environment validation failed:\n${result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n')}`
  );
}

export const config = result.data;

export type Config = typeof config;