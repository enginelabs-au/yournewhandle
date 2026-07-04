import { NextResponse } from "next/server";
import {
  authenticateApiRequest,
  withRateLimitHeaders,
} from "@/lib/api/auth";
import { getUsageSnapshot } from "@/lib/api/rate-limit";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const usage = await getUsageSnapshot(auth.key.id, auth.limits);

  const response = NextResponse.json({
    key: {
      id: auth.key.id,
      label: auth.key.label,
      plan: auth.key.plan,
    },
    limits: auth.limits,
    usage: {
      minuteUsed: usage.minuteUsed,
      dayUsed: usage.dayUsed,
      minuteRemaining: Math.max(0, auth.limits.requestsPerMinute - usage.minuteUsed),
      dayRemaining: Math.max(0, auth.limits.requestsPerDay - usage.dayUsed),
      tracking: usage.tracking,
    },
  });

  return withRateLimitHeaders(response, auth.rateLimit);
}
