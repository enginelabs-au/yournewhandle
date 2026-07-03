import type { GenerationParams } from "@/lib/types";
import { resolvePlatformLengthWindow } from "@/lib/platform-length-bounds";

export function getEffectiveLengthBounds(params: GenerationParams): {
  minLen: number;
  maxLen: number;
  platformConstrained: boolean;
  overlapMin: number;
  overlapMax: number;
} {
  return resolvePlatformLengthWindow(
    params.targetPlatforms,
    params.minLen,
    params.maxLen,
  );
}

/** Apply platform length intersection before generation. */
export function resolveGenerationParams(
  params: GenerationParams,
): GenerationParams {
  const { minLen, maxLen } = getEffectiveLengthBounds(params);
  return { ...params, minLen, maxLen };
}

export function platformLengthConflict(params: GenerationParams): string | null {
  const { minLen, maxLen, platformConstrained, overlapMin, overlapMax } =
    getEffectiveLengthBounds(params);

  if (!platformConstrained) {
    return null;
  }

  if (overlapMin > overlapMax) {
    return `Selected platforms have no overlapping length window (need ${overlapMin}–${overlapMax}).`;
  }

  if (minLen > maxLen) {
    return `Platform targets require ${overlapMin}–${overlapMax} chars but your length slider is ${params.minLen}–${params.maxLen}.`;
  }

  return null;
}
