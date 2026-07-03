import { Redis } from "@upstash/redis";
import type { CheckStatus } from "@/lib/types";

const GITHUB_CACHE_TTL_SECONDS = 10 * 60;
const CACHE_PREFIX = "ynh:github:";

export type GithubCacheEntry = {
  status: CheckStatus;
  message?: string;
};

function getRedis(): Redis | null {
  const hasUpstash =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasVercelKv =
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

  if (!hasUpstash && !hasVercelKv) {
    return null;
  }

  try {
    return Redis.fromEnv();
  } catch {
    return null;
  }
}

export async function getGithubCache(
  handle: string,
): Promise<GithubCacheEntry | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    return await redis.get<GithubCacheEntry>(`${CACHE_PREFIX}${handle.toLowerCase()}`);
  } catch {
    return null;
  }
}

export async function setGithubCache(
  handle: string,
  entry: GithubCacheEntry,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    await redis.set(`${CACHE_PREFIX}${handle.toLowerCase()}`, entry, {
      ex: GITHUB_CACHE_TTL_SECONDS,
    });
  } catch {
    // Cache write failures should not break checks.
  }
}

export function isGithubCacheConfigured(): boolean {
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  );
}
