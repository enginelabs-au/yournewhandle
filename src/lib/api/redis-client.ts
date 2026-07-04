import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

export function getApiRedis(): Redis | null {
  if (client !== undefined) {
    return client;
  }

  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasVercelKv =
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (!hasUpstash && !hasVercelKv) {
    client = null;
    return client;
  }

  try {
    client = Redis.fromEnv();
  } catch {
    client = null;
  }

  return client;
}

export function isApiRedisConfigured(): boolean {
  return getApiRedis() !== null;
}
