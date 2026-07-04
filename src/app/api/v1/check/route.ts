import { NextResponse } from "next/server";
import {
  authenticateApiRequest,
  withRateLimitHeaders,
} from "@/lib/api/auth";
import { checkPlatformService } from "@/lib/api/check-service";
import {
  getPlatformById,
  profileUrlForPlatform,
} from "@/lib/platforms-registry";

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  let body: {
    handle?: string;
    platformId?: string;
    service?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const handle = body.handle?.trim();
  if (!handle) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "handle is required." } },
      { status: 400 },
    );
  }

  let service = body.service?.trim();
  let platformId = body.platformId?.trim();

  if (platformId) {
    const platform = getPlatformById(platformId);
    if (!platform) {
      return NextResponse.json(
        { error: { code: "invalid_request", message: "Unknown platformId." } },
        { status: 400 },
      );
    }
    service = platform.nickCheckrService;
    platformId = platform.id;
  }

  if (!service) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "platformId or service is required.",
        },
      },
      { status: 400 },
    );
  }

  const outcome = await checkPlatformService(handle, service);

  if ("error" in outcome) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: outcome.error } },
      { status: outcome.status },
    );
  }

  const platform = platformId ? getPlatformById(platformId) : undefined;
  const profileUrl = platform
    ? profileUrlForPlatform(platform, outcome.handle)
    : undefined;

  const response = NextResponse.json({
    handle: outcome.handle,
    platformId: platform?.id ?? platformId ?? null,
    service: outcome.service,
    status: outcome.status,
    message: outcome.message,
    profileUrl,
    cached: outcome.cached,
  });

  return withRateLimitHeaders(response, auth.rateLimit);
}
