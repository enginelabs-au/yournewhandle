/** Username length bounds for platform sweet-spot targeting (AESTH-17). */

export type PlatformLengthBound = {
  id: string;
  label: string;
  min: number;
  max: number;
};

export const TARGET_PLATFORM_OPTIONS: PlatformLengthBound[] = [
  { id: "twitter", label: "X / Twitter", min: 4, max: 15 },
  { id: "github", label: "GitHub", min: 1, max: 39 },
  { id: "telegram", label: "Telegram", min: 5, max: 32 },
  { id: "instagram", label: "Instagram", min: 1, max: 30 },
  { id: "tiktok", label: "TikTok", min: 2, max: 24 },
  { id: "discord", label: "Discord", min: 2, max: 32 },
  { id: "reddit", label: "Reddit", min: 3, max: 20 },
  { id: "twitch", label: "Twitch", min: 4, max: 25 },
];

const BOUNDS_BY_ID = Object.fromEntries(
  TARGET_PLATFORM_OPTIONS.map((option) => [option.id, option]),
) as Record<string, PlatformLengthBound>;

export function resolvePlatformLengthWindow(
  platformIds: readonly string[],
  userMin: number,
  userMax: number,
): {
  minLen: number;
  maxLen: number;
  platformConstrained: boolean;
  overlapMin: number;
  overlapMax: number;
} {
  if (platformIds.length === 0) {
    return {
      minLen: userMin,
      maxLen: userMax,
      platformConstrained: false,
      overlapMin: userMin,
      overlapMax: userMax,
    };
  }

  let overlapMin = 1;
  let overlapMax = 999;

  for (const id of platformIds) {
    const bound = BOUNDS_BY_ID[id];
    if (!bound) {
      continue;
    }
    overlapMin = Math.max(overlapMin, bound.min);
    overlapMax = Math.min(overlapMax, bound.max);
  }

  return {
    minLen: Math.max(userMin, overlapMin),
    maxLen: Math.min(userMax, overlapMax),
    platformConstrained: true,
    overlapMin,
    overlapMax,
  };
}

export function formatPlatformWindow(platformIds: readonly string[]): string {
  if (platformIds.length === 0) {
    return "";
  }
  const { overlapMin, overlapMax } = resolvePlatformLengthWindow(
    platformIds,
    1,
    999,
  );
  return `${overlapMin}–${overlapMax} chars`;
}
