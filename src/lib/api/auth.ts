import { NextResponse } from "next/server";
import { lookupApiKey, apiKeysConfiguredCount, type ApiKeyRecord } from "@/lib/api/keys";
import { enforceRateLimit, type RateLimitResult } from "@/lib/api/rate-limit";
import { API_PLAN_LIMITS, type ApiPlan } from "@/lib/api/plans";

export type ApiAuthContext = {
  key: ApiKeyRecord;
  plan: ApiPlan;
  limits: (typeof API_PLAN_LIMITS)[ApiPlan];
  rateLimit: RateLimitResult;
};

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization")?.trim();
  if (!header) {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export function unauthorizedResponse(message = "Missing or invalid API key."): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "unauthorized",
        message,
      },
    },
    {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="yournewhandle API"' },
    },
  );
}

export function apiDisabledResponse(): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "api_disabled",
        message:
          "The yournewhandle API is not configured on this deployment. Contact support for access.",
      },
    },
    { status: 503 },
  );
}

export function rateLimitedResponse(rateLimit: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "rate_limit_exceeded",
        message: "Rate limit exceeded. Retry after the reset time.",
        retryAfter: rateLimit.retryAfterSeconds,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
        "X-RateLimit-Limit-Minute": String(rateLimit.minuteLimit),
        "X-RateLimit-Remaining-Minute": String(rateLimit.minuteRemaining),
        "X-RateLimit-Limit-Day": String(rateLimit.dayLimit),
        "X-RateLimit-Remaining-Day": String(rateLimit.dayRemaining),
      },
    },
  );
}

export async function authenticateApiRequest(
  request: Request,
): Promise<ApiAuthContext | NextResponse> {
  const token = extractBearerToken(request);
  const key = lookupApiKey(token);

  if (!key) {
    if (apiKeysConfiguredCount() === 0) {
      return apiDisabledResponse();
    }
    return unauthorizedResponse();
  }

  const limits = API_PLAN_LIMITS[key.plan];
  const rateLimit = await enforceRateLimit(key.id, limits);

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit);
  }

  return {
    key,
    plan: key.plan,
    limits,
    rateLimit,
  };
}

export function withRateLimitHeaders(
  response: NextResponse,
  rateLimit: RateLimitResult,
): NextResponse {
  response.headers.set("X-RateLimit-Limit-Minute", String(rateLimit.minuteLimit));
  response.headers.set(
    "X-RateLimit-Remaining-Minute",
    String(rateLimit.minuteRemaining),
  );
  response.headers.set("X-RateLimit-Limit-Day", String(rateLimit.dayLimit));
  response.headers.set("X-RateLimit-Remaining-Day", String(rateLimit.dayRemaining));
  return response;
}
