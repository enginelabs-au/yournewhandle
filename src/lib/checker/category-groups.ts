import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { PlatformCategory } from "@/lib/platforms-registry.types";
import { POPULAR_PLATFORM_IDS } from "@/lib/platforms-registry";

/** Most popular / user-facing categories first; domain TLDs last. */
export const CATEGORY_DISPLAY_ORDER: PlatformCategory[] = [
  "Popular",
  "Social Media",
  "Messaging",
  "Developer",
  "Video & Streaming",
  "Gaming",
  "Music & Audio",
  "Content & Blogging",
  "Creative & Design",
  "Professional",
  "Community",
  "Photography",
  "Marketplace",
  "Finance & Crypto",
  "Education & Learning",
  "Fitness & Sports",
  "Domain Names",
];

export const DEFAULT_OPEN_CATEGORIES = new Set<PlatformCategory>(["Popular"]);

export type CategoryPlatformGroup = {
  category: PlatformCategory;
  platforms: PlatformCheckResult[];
};

export function groupPlatformsByCategory(
  platforms: PlatformCheckResult[],
): CategoryPlatformGroup[] {
  const byCategory = new Map<PlatformCategory, PlatformCheckResult[]>();

  const popularPlatforms = platforms.filter((platform) =>
    POPULAR_PLATFORM_IDS.has(platform.platformId),
  );

  if (popularPlatforms.length > 0) {
    byCategory.set("Popular", popularPlatforms);
  }

  for (const platform of platforms) {
    const list = byCategory.get(platform.category) ?? [];
    list.push(platform);
    byCategory.set(platform.category, list);
  }

  const ordered: CategoryPlatformGroup[] = [];

  for (const category of CATEGORY_DISPLAY_ORDER) {
    const group = byCategory.get(category);
    if (group?.length) {
      ordered.push({ category, platforms: group });
      byCategory.delete(category);
    }
  }

  for (const [category, group] of byCategory) {
    if (group.length) {
      ordered.push({ category, platforms: group });
    }
  }

  return ordered;
}

export type CategoryStatusSummary = {
  available: number;
  taken: number;
  loading: number;
  unknown: number;
};

export function summarizeCategoryStatuses(
  platforms: PlatformCheckResult[],
): CategoryStatusSummary {
  const summary: CategoryStatusSummary = {
    available: 0,
    taken: 0,
    loading: 0,
    unknown: 0,
  };

  for (const platform of platforms) {
    switch (platform.status) {
      case "available":
        summary.available += 1;
        break;
      case "taken":
      case "error":
        summary.taken += 1;
        break;
      case "loading":
        summary.loading += 1;
        break;
      default:
        summary.unknown += 1;
    }
  }

  return summary;
}

export function categoryCollapsedSubtitle(
  platforms: PlatformCheckResult[],
): string {
  const preview = platforms
    .slice(0, 4)
    .map((platform) => platform.name)
    .join(", ");
  const remaining = platforms.length - 4;

  if (remaining <= 0) {
    return preview;
  }

  return `${preview} +${remaining} more`;
}

export function summarizeHandleAvailability(
  platforms: PlatformCheckResult[],
): "available" | "taken" | "unknown" {
  let taken = 0;
  let unknown = 0;
  let available = 0;

  for (const platform of platforms) {
    switch (platform.status) {
      case "taken":
      case "error":
        taken += 1;
        break;
      case "available":
        available += 1;
        break;
      case "loading":
      case "idle":
        return "unknown";
      default:
        unknown += 1;
    }
  }

  if (taken > 0) {
    return "taken";
  }
  if (unknown > 0) {
    return "unknown";
  }
  if (available > 0) {
    return "available";
  }
  return "unknown";
}
