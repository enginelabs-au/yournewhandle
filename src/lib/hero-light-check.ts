import { checkHandlePlatforms } from "@/lib/checker/orchestrator";
import type { PlatformCheckResult } from "@/lib/checker/report-types";
import {
  POPULAR_PLATFORM_IDS,
  type CheckMode,
} from "@/lib/platforms-registry";

export const HERO_LIGHT_CHECK_MODE: CheckMode = "light";

/** True when every wired popular-platform result is available. */
export function isLightCheckFullyAvailable(
  platforms: PlatformCheckResult[],
): boolean {
  const checked = platforms.filter(
    (platform) =>
      POPULAR_PLATFORM_IDS.has(platform.platformId) &&
      platform.status !== "idle" &&
      platform.status !== "loading",
  );
  if (checked.length === 0) {
    return false;
  }
  return checked.every((platform) => platform.status === "available");
}

export async function isHandleLightAvailable(
  handle: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const results = await checkHandlePlatforms(
    handle,
    HERO_LIGHT_CHECK_MODE,
    signal,
  );
  return isLightCheckFullyAvailable(results);
}
