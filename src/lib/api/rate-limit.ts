import { getApiRedis, isApiRedisConfigured } from "@/lib/api/redis-client";
import type { ApiPlanLimits } from "@/lib/api/plans";

export type RateLimitResult = {
  allowed: boolean;
  minuteLimit: number;
  minuteRemaining: number;
  dayLimit: number;
  dayRemaining: number;
  retryAfterSeconds: number;
};

const inMemoryMinute = new Map<string, { count: number; resetAt: number }>();
const inMemoryDay = new Map<string, { count: number; resetAt: number }>();

function minuteBucketKey(keyId: string): string {
  const minute = Math.floor(Date.now() / 60_000);
  return `ynh:api:rl:min:${keyId}:${minute}`;
}

function dayBucketKey(keyId: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `ynh:api:usage:day:${keyId}:${day}`;
}

function inMemoryIncrement(
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  ttlMs: number,
): number {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + ttlMs });
    return 1;
  }
  existing.count += 1;
  return existing.count;
}

export async function enforceRateLimit(
  keyId: string,
  limits: ApiPlanLimits,
): Promise<RateLimitResult> {
  const redis = getApiRedis();

  if (redis) {
    try {
      const minKey = minuteBucketKey(keyId);
      const dayKey = dayBucketKey(keyId);

      const [minuteCount, dayCount] = await Promise.all([
        redis.incr(minKey),
        redis.incr(dayKey),
      ]);

      if (minuteCount === 1) {
        await redis.expire(minKey, 90);
      }
      if (dayCount === 1) {
        await redis.expire(dayKey, 86_400);
      }

      const minuteRemaining = Math.max(0, limits.requestsPerMinute - minuteCount);
      const dayRemaining = Math.max(0, limits.requestsPerDay - dayCount);
      const allowed =
        minuteCount <= limits.requestsPerMinute && dayCount <= limits.requestsPerDay;

      return {
        allowed,
        minuteLimit: limits.requestsPerMinute,
        minuteRemaining,
        dayLimit: limits.requestsPerDay,
        dayRemaining,
        retryAfterSeconds: allowed ? 0 : 60,
      };
    } catch {
      // Fall through to in-memory on Redis errors.
    }
  }

  const minKey = minuteBucketKey(keyId);
  const dayKey = dayBucketKey(keyId);
  const minuteCount = inMemoryIncrement(inMemoryMinute, minKey, 90_000);
  const dayCount = inMemoryIncrement(inMemoryDay, dayKey, 86_400_000);

  const minuteRemaining = Math.max(0, limits.requestsPerMinute - minuteCount);
  const dayRemaining = Math.max(0, limits.requestsPerDay - dayCount);
  const allowed =
    minuteCount <= limits.requestsPerMinute && dayCount <= limits.requestsPerDay;

  return {
    allowed,
    minuteLimit: limits.requestsPerMinute,
    minuteRemaining,
    dayLimit: limits.requestsPerDay,
    dayRemaining,
    retryAfterSeconds: allowed ? 0 : 60,
  };
}

export async function getUsageSnapshot(
  keyId: string,
  limits: ApiPlanLimits,
): Promise<{
  minuteUsed: number;
  dayUsed: number;
  tracking: "redis" | "memory" | "unavailable";
}> {
  const redis = getApiRedis();

  if (redis) {
    try {
      const [minuteCount, dayCount] = await Promise.all([
        redis.get<number>(minuteBucketKey(keyId)),
        redis.get<number>(dayBucketKey(keyId)),
      ]);

      return {
        minuteUsed: minuteCount ?? 0,
        dayUsed: dayCount ?? 0,
        tracking: "redis",
      };
    } catch {
      // fall through
    }
  }

  if (isApiRedisConfigured()) {
    return { minuteUsed: 0, dayUsed: 0, tracking: "unavailable" };
  }

  const minEntry = inMemoryMinute.get(minuteBucketKey(keyId));
  const dayEntry = inMemoryDay.get(dayBucketKey(keyId));
  const now = Date.now();

  return {
    minuteUsed: minEntry && minEntry.resetAt > now ? minEntry.count : 0,
    dayUsed: dayEntry && dayEntry.resetAt > now ? dayEntry.count : 0,
    tracking: "memory",
  };
}
