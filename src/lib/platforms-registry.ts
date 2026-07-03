import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { CheckStatus } from "@/lib/types";
import {
  GENERATED_PLATFORM_CATEGORIES,
  GENERATED_PLATFORM_DEFINITIONS,
} from "@/lib/platforms-registry.generated";
import type { PlatformCategory, PlatformDefinition } from "@/lib/platforms-registry.types";

export type { PlatformCategory, PlatformDefinition } from "@/lib/platforms-registry.types";

export type CheckMode = "light" | "deep";

/** Excluded from username checker UI and checks (TLD / DNS entries). */
export const EXCLUDED_CHECKER_CATEGORIES = ["Domain Names"] as const;

function isCheckerPlatform(platform: PlatformDefinition): boolean {
  return !EXCLUDED_CHECKER_CATEGORIES.includes(
    platform.category as (typeof EXCLUDED_CHECKER_CATEGORIES)[number],
  );
}

export const CHECKER_PLATFORM_DEFINITIONS: PlatformDefinition[] =
  GENERATED_PLATFORM_DEFINITIONS.filter(isCheckerPlatform);

export const CHECKER_PLATFORM_CATEGORIES = GENERATED_PLATFORM_CATEGORIES.filter(
  (category) =>
    !EXCLUDED_CHECKER_CATEGORIES.includes(
      category as (typeof EXCLUDED_CHECKER_CATEGORIES)[number],
    ),
);

export const POPULAR_PLATFORM_COUNT = 50;

type PlatformResultOverrides = Partial<
  Omit<
    PlatformCheckResult,
    | "platformId"
    | "name"
    | "category"
    | "visitUrl"
    | "color"
    | "abbr"
    | "iconSlug"
  >
> & { status?: CheckStatus };

export function platformCheckResult(
  platform: PlatformDefinition,
  overrides: PlatformResultOverrides = {},
): PlatformCheckResult {
  return {
    platformId: platform.id,
    name: platform.name,
    category: platform.category,
    visitUrl: platform.visitUrl,
    color: platform.color,
    abbr: platform.abbr,
    iconSlug: platform.iconSlug,
    status: overrides.status ?? "idle",
    message: overrides.message,
    latencyMs: overrides.latencyMs,
    profileUrl: overrides.profileUrl,
  };
}

export function platformIconUrl(slug: string, color: string): string {
  const hex = color.replace("#", "");
  if (hex.startsWith("hsl")) {
    return `https://cdn.simpleicons.org/${slug}`;
  }
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
}

export function profileUrlForPlatform(
  platform: PlatformDefinition,
  handle: string,
): string {
  return platform.urlTemplate.replace(/\{\}/g, handle);
}

export const PLATFORM_REGISTRY: PlatformDefinition[] = [
  ...CHECKER_PLATFORM_DEFINITIONS,
].sort(
  (a, b) => a.popularity - b.popularity || a.name.localeCompare(b.name),
);

/** Top 50 by popularity — used for light check and the Popular section. */
export const POPULAR_PLATFORMS = PLATFORM_REGISTRY.slice(0, POPULAR_PLATFORM_COUNT);

export const POPULAR_PLATFORM_IDS = new Set(
  POPULAR_PLATFORMS.map((platform) => platform.id),
);

export const PLATFORM_COUNT = PLATFORM_REGISTRY.length;

export function platformsForCheckMode(mode: CheckMode): PlatformDefinition[] {
  return mode === "light" ? POPULAR_PLATFORMS : PLATFORM_REGISTRY;
}

export function platformCountForCheckMode(mode: CheckMode): number {
  return mode === "light" ? POPULAR_PLATFORMS.length : PLATFORM_COUNT;
}

export const FILTER_TABS: { id: PlatformCategory | "All"; label: string }[] = [
  { id: "All", label: "All" },
  { id: "Popular", label: "Popular" },
  ...CHECKER_PLATFORM_CATEGORIES.map((category) => ({
    id: category as PlatformCategory,
    label: category,
  })),
];

export function countPlatformsByCategory(
  platforms: { platformId: string; category: string }[],
): Record<string, number> {
  const counts: Record<string, number> = {
    All: platforms.length,
    Popular: platforms.filter((platform) =>
      POPULAR_PLATFORM_IDS.has(platform.platformId),
    ).length,
  };
  for (const platform of platforms) {
    counts[platform.category] = (counts[platform.category] ?? 0) + 1;
  }
  return counts;
}

export function getPlatformById(id: string): PlatformDefinition | undefined {
  return PLATFORM_REGISTRY.find((platform) => platform.id === id);
}

export function mergeReportIntoAllPlatforms(
  handle: string,
  reportPlatforms: PlatformCheckResult[],
): PlatformCheckResult[] {
  const byId = new Map(reportPlatforms.map((platform) => [platform.platformId, platform]));

  return PLATFORM_REGISTRY.map((platform) => {
    const existing = byId.get(platform.id);
    if (existing) {
      return existing;
    }
    return platformCheckResult(platform, {
      profileUrl: profileUrlForPlatform(platform, handle),
    });
  });
}
