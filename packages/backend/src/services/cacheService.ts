import { createClient, RedisClientType } from 'redis';
import { config } from '../config';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({ url: config.REDIS_URL });
  await redisClient.connect();
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const data = await client.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
  const client = await getRedisClient();
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function deleteCache(key: string): Promise<void> {
  const client = await getRedisClient();
  await client.del(key);
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = await getRedisClient();
  let cursor = '0';
  
  do {
    const [newCursor, keys] = await client.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });
    cursor = newCursor;
    
    if (keys.length > 0) {
      await client.del(keys);
    }
  } while (cursor !== '0');
}

export async function incrementVoteBuffer(proposalId: string): Promise<number> {
  const client = await getRedisClient();
  const key = `vote:buffer:${proposalId}`;
  return await client.incr(key);
}

export async function getVoteBuffer(proposalId: string): Promise<number> {
  const client = await getRedisClient();
  const key = `vote:buffer:${proposalId}`;
  const value = await client.get(key);
  return value ? parseInt(value, 10) : 0;
}

export async function checkUserVoted(userId: string, proposalId: string): Promise<boolean> {
  const client = await getRedisClient();
  const key = `vote:${proposalId}:${userId}`;
  const exists = await client.exists(key);
  return exists === 1;
}

export async function setUserVoted(userId: string, proposalId: string): Promise<void> {
  const client = await getRedisClient();
  const key = `vote:${proposalId}:${userId}`;
  await client.set(key, '1', { EX: 300 });
}

export async function removeUserVote(userId: string, proposalId: string): Promise<void> {
  const client = await getRedisClient();
  const key = `vote:${proposalId}:${userId}`;
  await client.del(key);
}