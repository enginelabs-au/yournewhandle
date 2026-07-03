import {
  PLATFORM_REGISTRY,
  platformCheckResult,
  type PlatformDefinition,
} from "@/lib/platforms-registry";
import type { PlatformCheckResult } from "./report-types";
import { checkGithub } from "./socials";
import { isValidHostname, normalizeHandleForCheck } from "./constants";
import type { CheckReport } from "./report-types";
import { emptyReport, loadingReport } from "./report-types";

export type { CheckReport, PlatformCheckResult } from "./report-types";
export { emptyReport, loadingReport } from "./report-types";

const DEBOUNCE_MS = 300;
const PLATFORM_COUNT = PLATFORM_REGISTRY.length;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let activeController: AbortController | null = null;

export type CheckUpdateCallback = (report: CheckReport) => void;

export function runChecker(handle: string, onUpdate: CheckUpdateCallback): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void executeChecks(handle, onUpdate);
  }, DEBOUNCE_MS);
}

export function cancelChecker(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  activeController?.abort();
  activeController = null;
}

function profileUrlFor(platform: PlatformDefinition, handle: string): string {
  switch (platform.id) {
    case "github":
      return `https://github.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "telegram":
      return `https://t.me/${handle}`;
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "youtube":
      return `https://youtube.com/@${handle}`;
    case "twitch":
      return `https://twitch.tv/${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    case "reddit":
      return `https://reddit.com/user/${handle}`;
    case "discord":
      return platform.visitUrl;
    default:
      return `${platform.visitUrl}/${handle}`;
  }
}

function idlePlatform(
  platform: PlatformDefinition,
  profileUrl: string,
  message?: string,
): PlatformCheckResult {
  return platformCheckResult(platform, {
    status: "idle",
    message,
    profileUrl,
  });
}

async function checkPlatform(
  platform: PlatformDefinition,
  handle: string,
  signal: AbortSignal,
): Promise<PlatformCheckResult> {
  const started = performance.now();
  const profileUrl = profileUrlFor(platform, handle);

  if (platform.id === "github") {
    const result = await checkGithub(handle, signal);
    return platformCheckResult(platform, {
      status: result.status,
      message: result.message,
      latencyMs: Math.round(performance.now() - started),
      profileUrl: result.deepLink ?? profileUrl,
    });
  }

  if (platform.id === "twitter") {
    const { checkTwitter } = await import("./socials");
    const result = checkTwitter(handle);
    return platformCheckResult(platform, {
      status: result.status,
      message: result.message,
      latencyMs: Math.round(performance.now() - started),
      profileUrl: result.deepLink ?? profileUrl,
    });
  }

  if (platform.id === "telegram") {
    const { checkTelegram } = await import("./socials");
    const result = checkTelegram(handle);
    return platformCheckResult(platform, {
      status: result.status,
      message: result.message,
      latencyMs: Math.round(performance.now() - started),
      profileUrl: result.deepLink ?? profileUrl,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 80));

  return idlePlatform(
    platform,
    profileUrl,
    "API integration coming soon",
  );
}

async function executeChecks(
  handle: string,
  onUpdate: CheckUpdateCallback,
): Promise<void> {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const { signal } = controller;

  const normalized = normalizeHandleForCheck(handle);

  if (!normalized || !isValidHostname(normalized)) {
    onUpdate({
      ...emptyReport(handle),
      error: "Invalid username (use letters, numbers, hyphens)",
    });
    return;
  }

  const results: PlatformCheckResult[] = [];

  onUpdate({
    handle,
    normalized,
    platforms: [],
    progress: { current: 0, total: PLATFORM_COUNT },
    isRunning: true,
  });

  try {
    for (let i = 0; i < PLATFORM_REGISTRY.length; i++) {
      if (signal.aborted) return;

      const platform = PLATFORM_REGISTRY[i]!;
      const profileUrl = profileUrlFor(platform, normalized);

      const loadingPlatforms: PlatformCheckResult[] = PLATFORM_REGISTRY.map(
        (p, idx) => {
          const url = profileUrlFor(p, normalized);
          if (idx < i) return results[idx]!;
          if (idx === i) {
            return platformCheckResult(p, {
              status: "loading",
              profileUrl: url,
            });
          }
          return idlePlatform(p, url);
        },
      );

      onUpdate({
        handle,
        normalized,
        platforms: loadingPlatforms,
        progress: { current: i + 1, total: PLATFORM_COUNT },
        isRunning: true,
      });

      const result = await checkPlatform(platform, normalized, signal);
      results.push(result);

      if (signal.aborted) return;

      onUpdate({
        handle,
        normalized,
        platforms: [
          ...results,
          ...PLATFORM_REGISTRY.slice(i + 1).map((p) =>
            idlePlatform(p, profileUrlFor(p, normalized)),
          ),
        ],
        progress: { current: i + 1, total: PLATFORM_COUNT },
        isRunning: i + 1 < PLATFORM_COUNT,
      });
    }

    onUpdate({
      handle,
      normalized,
      platforms: results,
      progress: { current: PLATFORM_COUNT, total: PLATFORM_COUNT },
      isRunning: false,
    });
  } catch {
    if (signal.aborted) return;
    onUpdate({
      ...emptyReport(handle),
      error: "Checker failed — network error",
    });
  }
}
