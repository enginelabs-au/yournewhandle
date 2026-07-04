import { NextResponse } from "next/server";
import {
  authenticateApiRequest,
  withRateLimitHeaders,
} from "@/lib/api/auth";
import { PLATFORM_REGISTRY } from "@/lib/platforms-registry";

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const response = NextResponse.json({
    count: PLATFORM_REGISTRY.length,
    platforms: PLATFORM_REGISTRY.map((platform) => ({
      id: platform.id,
      name: platform.name,
      category: platform.category,
      service: platform.nickCheckrService,
      wired: platform.wired,
      visitUrl: platform.visitUrl,
      popularity: platform.popularity,
    })),
  });

  return withRateLimitHeaders(response, auth.rateLimit);
}
