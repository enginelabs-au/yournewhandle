import { NextResponse } from "next/server";
import {
  authenticateApiRequest,
  withRateLimitHeaders,
} from "@/lib/api/auth";
import { checkManyPlatformServices } from "@/lib/api/check-service";
import {
  getPlatformById,
  platformsForCheckMode,
  profileUrlForPlatform,
  type CheckMode,
} from "@/lib/platforms-registry";

type BatchResult = {
  handle: string;
  platformId: string;
  service: string;
  status: string;
  message?: string;
  profileUrl?: string;
  cached?: boolean;
};

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  let body: {
    handles?: string[];
    mode?: CheckMode;
    platformIds?: string[];
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const handles = body.handles?.map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!handles?.length) {
    return NextResponse.json(
      { error: { code: "invalid_request", message: "handles array is required." } },
      { status: 400 },
    );
  }

  if (handles.length > auth.limits.maxBatchHandles) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: `Your plan allows up to ${auth.limits.maxBatchHandles} handles per batch.`,
        },
      },
      { status: 400 },
    );
  }

  const mode: CheckMode = body.mode === "deep" ? "deep" : "light";

  if (mode === "deep" && !auth.limits.allowDeepCheck) {
    return NextResponse.json(
      {
        error: {
          code: "plan_forbidden",
          message: "Deep check requires a Pro or Enterprise plan.",
        },
      },
      { status: 403 },
    );
  }

  let platforms = platformsForCheckMode(mode);

  if (body.platformIds?.length) {
    const resolved = body.platformIds
      .map((id) => getPlatformById(id.trim()))
      .filter((platform) => platform !== undefined);

    if (resolved.length === 0) {
      return NextResponse.json(
        { error: { code: "invalid_request", message: "No valid platformIds." } },
        { status: 400 },
      );
    }

    platforms = resolved;
  }

  if (platforms.length > auth.limits.maxBatchPlatforms) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: `Your plan allows up to ${auth.limits.maxBatchPlatforms} platforms per batch.`,
        },
      },
      { status: 400 },
    );
  }

  const wiredPlatforms = platforms.filter((platform) => platform.wired);
  const results: BatchResult[] = [];

  for (const handle of handles) {
    const serviceNames = wiredPlatforms.map((platform) => platform.nickCheckrService);
    const checks = await checkManyPlatformServices(handle, serviceNames, 8);

    for (const check of checks) {
      const platform = wiredPlatforms.find(
        (entry) => entry.nickCheckrService === check.service,
      );
      if (!platform) {
        continue;
      }

      results.push({
        handle: check.handle,
        platformId: platform.id,
        service: check.service,
        status: check.status,
        message: check.message,
        profileUrl: profileUrlForPlatform(platform, check.handle),
        cached: check.cached,
      });
    }
  }

  const response = NextResponse.json({
    mode,
    handleCount: handles.length,
    platformCount: wiredPlatforms.length,
    resultCount: results.length,
    results,
  });

  return withRateLimitHeaders(response, auth.rateLimit);
}
