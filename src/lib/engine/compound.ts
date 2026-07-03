import type { GenerationParams } from "@/lib/types";
import { MEDIUM_ROOTS, SHORT_ROOTS } from "./dictionary-words";
import { blendCompoundParts } from "./blend";
import { applyPrefixSuffix, innerLengthBudget } from "./constraints";
import { buildWordCore, fitToLengthRange } from "./phonetic";
import { pickRandom, randomBetween } from "./random";

/** Use multi-part word stitching above this inner length. */
export const LONG_HANDLE_THRESHOLD = 14;

export function isLongHandleTarget(params: GenerationParams): boolean {
  const { min, max } = innerLengthBudget(params);
  return max > LONG_HANDLE_THRESHOLD || min > LONG_HANDLE_THRESHOLD;
}

function pickWordChunk(minChars: number, maxChars: number): string | null {
  const exact = [...SHORT_ROOTS, ...MEDIUM_ROOTS].filter(
    (word) => word.length >= minChars && word.length <= maxChars,
  );
  if (exact.length > 0) {
    return pickRandom(exact);
  }

  const loose = [...SHORT_ROOTS, ...MEDIUM_ROOTS].filter(
    (word) => word.length <= maxChars && word.length >= 2,
  );
  if (loose.length === 0) {
    return null;
  }
  return pickRandom(loose);
}

function buildChunkPart(
  params: GenerationParams,
  minChars: number,
  maxChars: number,
): string | null {
  if (Math.random() < 0.88) {
    const word = pickWordChunk(minChars, maxChars);
    if (word) {
      return word;
    }
  }

  const syllableMax = Math.min(3, Math.max(1, Math.ceil(maxChars / 2)));
  const chunkParams: GenerationParams = {
    ...params,
    compound: false,
    affixTier: "off",
    prefix: "",
    suffix: "",
    phoneticEcho: false,
    blueprint: "dynamic",
    minLen: minChars,
    maxLen: maxChars,
    syllableCount: { min: 1, max: syllableMax },
  };

  return buildWordCore(chunkParams, syllableMax);
}

export function buildLongCompoundHandle(
  params: GenerationParams,
): string | null {
  const { min, max } = innerLengthBudget(params);

  for (let attempt = 0; attempt < 16; attempt += 1) {
    const targetLen = randomBetween(min, max);
    const parts: string[] = [];
    let length = 0;

    while (length < targetLen && parts.length < 10) {
      const remaining = targetLen - length;
      if (remaining <= 0) {
        break;
      }

      const chunkMax = Math.min(8, remaining + 1);
      const chunkMin = Math.min(3, chunkMax);
      const chunk = buildChunkPart(params, chunkMin, chunkMax);
      if (!chunk) {
        break;
      }

      parts.push(chunk);
      length += chunk.length;
    }

    if (parts.length < 2) {
      continue;
    }

    let combined = params.blendOverlap
      ? parts.reduce((acc, part, index) =>
          index === 0 ? part : blendCompoundParts(acc, part),
        )
      : parts.join("");

    combined = applyPrefixSuffix(combined, params.prefix, params.suffix);

    while (combined.length > max && parts.length > 1) {
      parts.pop();
      combined = applyPrefixSuffix(
        params.blendOverlap
          ? parts.reduce((acc, part, index) =>
              index === 0 ? part : blendCompoundParts(acc, part),
            )
          : parts.join(""),
        params.prefix,
        params.suffix,
      );
    }

    if (combined.length > max) {
      combined = combined.slice(0, max);
    }

    const fitted = fitToLengthRange(
      combined,
      params.minLen,
      params.maxLen,
      params,
    );
    if (fitted) {
      return fitted;
    }
  }

  return null;
}

export function buildCompoundHandle(params: GenerationParams): string | null {
  if (isLongHandleTarget(params)) {
    const longHandle = buildLongCompoundHandle(params);
    if (longHandle) {
      return longHandle;
    }
  }

  const partBudget = Math.max(
    2,
    Math.floor((params.minLen + params.maxLen) / 4),
  );

  const partParams: GenerationParams = {
    ...params,
    compound: false,
    prefix: "",
    suffix: "",
    minLen: partBudget,
    maxLen: partBudget + 2,
    syllableCount: { min: 1, max: 2 },
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const partA = buildWordCore(partParams, 1);
    const partB = buildWordCore(partParams, 1);

    if (!partA || !partB) {
      continue;
    }

    const combined = params.blendOverlap
      ? blendCompoundParts(partA, partB)
      : `${partA}${partB}`;
    const withAffixes = applyPrefixSuffix(
      combined,
      params.prefix,
      params.suffix,
    );
    return fitToLengthRange(
      withAffixes,
      params.minLen,
      params.maxLen,
      params,
    );
  }

  return null;
}
