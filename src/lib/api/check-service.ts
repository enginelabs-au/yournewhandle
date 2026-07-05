import {
  AvailabilityStatus,
  type CheckResult,
} from "@/lib/checker/nick-checkr/abstract-service";
import {
  getNickCheckCache,
  setNickCheckCache,
} from "@/lib/checker/nick-checkr/cache";
import { nicknameChecker } from "@/lib/checker/nick-checkr/nickname-checker";
import type { CheckStatus } from "@/lib/types";

export const HANDLE_CHECK_PATTERN =
  /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,38}[a-zA-Z0-9])?$/;

const validServices = new Set(nicknameChecker.getServiceNames());

export function isKnownCheckService(service: string): boolean {
  return validServices.has(service);
}

export function listCheckServices(): string[] {
  return nicknameChecker.getServiceNames();
}

function mapStatus(result: CheckResult): {
  status: CheckStatus;
  message?: string;
} {
  switch (result.status) {
    case AvailabilityStatus.Available:
      return { status: "available", message: "Username available" };
    case AvailabilityStatus.Taken:
      return { status: "taken", message: "Profile exists" };
    case AvailabilityStatus.Timeout:
      return { status: "unknown", message: "Check timed out" };
    case AvailabilityStatus.Error:
      return {
        status: "unknown",
        message: result.errorDetail ?? "Could not verify",
      };
    default:
      return { status: "unknown", message: "Unknown response" };
  }
}

export type PlatformCheckPayload = {
  handle: string;
  service: string;
  status: CheckStatus;
  message?: string;
  cached: boolean;
};

export async function checkPlatformService(
  handle: string,
  service: string,
): Promise<PlatformCheckPayload | { error: string; status: number }> {
  const normalized = handle.trim().toLowerCase();

  if (!normalized || !service) {
    return { error: "Missing handle or service", status: 400 };
  }

  if (!HANDLE_CHECK_PATTERN.test(normalized)) {
    return { error: "Invalid username format", status: 400 };
  }

  if (!validServices.has(service)) {
    return { error: "Unknown service", status: 404 };
  }

  const cacheKey = `v7:${normalized}:${service}`;
  const cached = getNickCheckCache<{
    status: CheckStatus;
    message?: string;
  }>(cacheKey);

  if (cached) {
    return {
      handle: normalized,
      service,
      status: cached.status,
      message: cached.message,
      cached: true,
    };
  }

  try {
    const result = await nicknameChecker.check(normalized, service);
    const mapped = mapStatus(result);

    const ttlMs =
      result.status === AvailabilityStatus.Error ||
      result.status === AvailabilityStatus.Timeout
        ? 5 * 60 * 1000
        : 30 * 60 * 1000;
    setNickCheckCache(cacheKey, mapped, ttlMs);

    return {
      handle: normalized,
      service,
      status: mapped.status,
      message: mapped.message,
      cached: false,
    };
  } catch (error) {
    console.error(`[check-platform] ${service} failed for ${normalized}:`, error);
    return { error: "Check failed", status: 500 };
  }
}

export async function checkManyPlatformServices(
  handle: string,
  services: string[],
  concurrency = 8,
): Promise<PlatformCheckPayload[]> {
  const results: PlatformCheckPayload[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < services.length) {
      const current = index;
      index += 1;
      const service = services[current]!;

      const outcome = await checkPlatformService(handle, service);
      if ("error" in outcome) {
        results.push({
          handle: handle.trim().toLowerCase(),
          service,
          status: "error",
          message: outcome.error,
          cached: false,
        });
      } else {
        results.push(outcome);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, services.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
}
