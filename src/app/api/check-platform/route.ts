import { NextResponse } from "next/server";
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

const NICK_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,38}[a-zA-Z0-9])?$/;
const validServices = new Set(nicknameChecker.getServiceNames());

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

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle")?.trim().toLowerCase();
  const service = searchParams.get("service");

  if (!handle || !service) {
    return NextResponse.json(
      { error: "Missing handle or service" },
      { status: 400 },
    );
  }

  if (!NICK_PATTERN.test(handle)) {
    return NextResponse.json(
      { error: "Invalid username format" },
      { status: 400 },
    );
  }

  if (!validServices.has(service)) {
    return NextResponse.json({ error: "Unknown service" }, { status: 404 });
  }

  const cacheKey = `v4:${handle}:${service}`;
  const cached = getNickCheckCache<{
    status: CheckStatus;
    message?: string;
  }>(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const result = await nicknameChecker.check(handle, service);
    const mapped = mapStatus(result);

    const ttlMs =
      result.status === AvailabilityStatus.Error ||
      result.status === AvailabilityStatus.Timeout
        ? 5 * 60 * 1000
        : 30 * 60 * 1000;
    setNickCheckCache(cacheKey, mapped, ttlMs);

    return NextResponse.json(mapped, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error(`[check-platform] ${service} failed for ${handle}:`, error);
    return NextResponse.json(
      { status: "error", message: "Check failed" },
      { status: 500 },
    );
  }
}
