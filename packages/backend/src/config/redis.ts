import { createClient, RedisClientType } from 'redis';
import { config } from '../config';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }
  client = createClient({ url: config.REDIS_URL });
  await client.connect();
  return client;
}

export async function closeRedis(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
}
