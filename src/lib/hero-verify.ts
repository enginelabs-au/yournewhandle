import { normalizeHandleForCheck, isValidHostname } from "@/lib/checker/constants";
import {
  PLATFORM_REGISTRY,
  platformCheckResult,
  profileUrlForPlatform,
} from "@/lib/platforms-registry";
import type { PlatformCheckResult } from "@/lib/checker/report-types";

/** Headline platforms the hero must pass before showing “Handle Available”. */
export const HERO_VERIFY_PLATFORM_IDS = [
  "instagram",
  "facebook",
  "twitter",
  "tiktok",
  "youtube",
  "reddit",
  "github",
  "discord",
  "twitch",
  "threads",
] as const;

const HERO_VERIFY_PLATFORMS = PLATFORM_REGISTRY.filter((platform) =>
  (HERO_VERIFY_PLATFORM_IDS as readonly string[]).includes(platform.id),
);

async function checkHeroPlatform(
  handle: string,
  signal: AbortSignal,
): Promise<PlatformCheckResult[]> {
  const normalized = normalizeHandleForCheck(handle);
  if (!normalized || !isValidHostname(normalized)) {
    return [];
  }

  return Promise.all(
    HERO_VERIFY_PLATFORMS.map(async (platform) => {
      const profileUrl = profileUrlForPlatform(platform, normalized);
      if (!platform.wired) {
        return platformCheckResult(platform, {
          status: "unknown",
          message: "Not wired",
          profileUrl,
        });
      }

      try {
        const params = new URLSearchParams({
          handle: normalized,
          service: platform.nickCheckrService,
        });
        const response = await fetch(`/api/check-platform?${params.toString()}`, {
          signal,
        });

        if (!response.ok) {
          return platformCheckResult(platform, {
            status: "unknown",
            message: "Check request failed",
            profileUrl,
          });
        }

        const data = (await response.json()) as {
          status?: PlatformCheckResult["status"];
          message?: string;
        };

        return platformCheckResult(platform, {
          status: data.status ?? "unknown",
          message: data.message,
          profileUrl,
        });
      } catch {
        if (signal.aborted) {
          return platformCheckResult(platform, { status: "idle", profileUrl });
        }
        return platformCheckResult(platform, {
          status: "unknown",
          message: "Network error",
          profileUrl,
        });
      }
    }),
  );
}

/** True when every wired hero platform returned available (no taken / error / unknown). */
export function isVerifiedHeroHandle(platforms: PlatformCheckResult[]): boolean {
  const checked = platforms.filter(
    (platform) => platform.status !== "idle" && platform.status !== "loading",
  );
  if (checked.length === 0) {
    return false;
  }
  return checked.every((platform) => platform.status === "available");
}

export async function isHandleVerifiedForHero(
  handle: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const results = await checkHeroPlatform(handle, signal ?? new AbortController().signal);
  return isVerifiedHeroHandle(results);
}
