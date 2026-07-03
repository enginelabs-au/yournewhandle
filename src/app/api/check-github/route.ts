import { NextResponse } from "next/server";
import {
  getGithubCache,
  isGithubCacheConfigured,
  setGithubCache,
} from "@/lib/cache/github";
import {
  validateGithubUsername,
  type SocialCheckResult,
} from "@/lib/checker/socials";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle") ?? "";

  const validationError = validateGithubUsername(handle);
  if (validationError) {
    const body: SocialCheckResult = {
      platform: "GitHub",
      target: handle,
      status: "error",
      message: validationError,
      deepLink: `https://github.com/${handle}`,
    };
    return NextResponse.json(body);
  }

  const cached = await getGithubCache(handle);
  if (cached) {
    const body: SocialCheckResult = {
      platform: "GitHub",
      target: handle,
      status: cached.status,
      message: cached.message ?? "Cached result",
      deepLink: `https://github.com/${handle}`,
    };
    return NextResponse.json(body);
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(handle)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 0 },
      },
    );

    if (response.status === 404) {
      await setGithubCache(handle, {
        status: "available",
        message: "Username not found",
      });
      const body: SocialCheckResult = {
        platform: "GitHub",
        target: handle,
        status: "available",
        message: "Username available",
        deepLink: `https://github.com/${handle}`,
      };
      return NextResponse.json(body);
    }

    if (response.status === 200) {
      await setGithubCache(handle, {
        status: "taken",
        message: "Profile exists",
      });
      const body: SocialCheckResult = {
        platform: "GitHub",
        target: handle,
        status: "taken",
        message: "Profile exists",
        deepLink: `https://github.com/${handle}`,
      };
      return NextResponse.json(body);
    }

    if (response.status === 403) {
      const cacheHint = isGithubCacheConfigured()
        ? "wait an hour or verify manually"
        : "add UPSTASH env vars + GITHUB_TOKEN to reduce limits";
      const body: SocialCheckResult = {
        platform: "GitHub",
        target: handle,
        status: "unknown",
        message: `GitHub rate limit hit — ${cacheHint}`,
        deepLink: `https://github.com/${handle}`,
      };
      return NextResponse.json(body);
    }

    const body: SocialCheckResult = {
      platform: "GitHub",
      target: handle,
      status: "error",
      message: `GitHub API returned ${response.status}`,
      deepLink: `https://github.com/${handle}`,
    };
    return NextResponse.json(body);
  } catch {
    const body: SocialCheckResult = {
      platform: "GitHub",
      target: handle,
      status: "error",
      message: "GitHub check failed",
      deepLink: `https://github.com/${handle}`,
    };
    return NextResponse.json(body);
  }
}
