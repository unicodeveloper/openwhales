import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      connectTimeout: 5000,
    });
    redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });
  }
  return redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    await client.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch {
    // Cache write failure is non-fatal
  }
}
