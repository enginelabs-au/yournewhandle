import type { GenerationParams } from "@/lib/types";
import type { Casing } from "@/lib/types";
import {
  LENGTH_INPUT_MAX,
  LENGTH_INPUT_MIN,
} from "@/lib/length-bounds";
import { randomBetween } from "./random";

export function applyCasing(value: string, casing: Casing): string {
  switch (casing) {
    case "upper":
      return value.toUpperCase();
    case "title":
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    default:
      return value.toLowerCase();
  }
}

export function constraintsSatisfiable(params: GenerationParams): boolean {
  const { prefix, suffix, minLen, maxLen } = params;
  const fixedLen = prefix.length + suffix.length;

  if (fixedLen > maxLen) {
    return false;
  }

  return minLen >= LENGTH_INPUT_MIN && maxLen <= LENGTH_INPUT_MAX && minLen <= maxLen;
}

export function containsBlockedChar(value: string, blocked: string[]): boolean {
  if (blocked.length === 0) {
    return false;
  }
  const blockedSet = new Set(blocked.map((c) => c.toLowerCase()));
  return [...value.toLowerCase()].some((char) => blockedSet.has(char));
}

export function filterByBlocked(
  items: readonly string[],
  blocked: string[],
): string[] {
  if (blocked.length === 0) {
    return [...items];
  }
  return items.filter((item) => !containsBlockedChar(item, blocked));
}

export function filterNuclei(
  nuclei: readonly string[],
  allowedVowels: string[],
): string[] {
  const allowed = new Set(allowedVowels.map((v) => v.toLowerCase()));
  return nuclei.filter((nucleus) =>
    [...allowed].some((vowel) => nucleus.toLowerCase().startsWith(vowel)),
  );
}

export function applyPrefixSuffix(
  word: string,
  prefix: string,
  suffix: string,
): string {
  let result = word.toLowerCase();

  if (prefix && !result.startsWith(prefix.toLowerCase())) {
    result = prefix.toLowerCase() + result;
  }

  if (suffix && !result.endsWith(suffix.toLowerCase())) {
    result = result + suffix.toLowerCase();
  }

  return result;
}

export function resolveTargetLength(params: GenerationParams): number {
  return randomBetween(params.minLen, params.maxLen);
}

export function resolveSyllableCount(params: GenerationParams): number {
  const { min, max } = params.syllableCount;
  if (min === max) {
    return min;
  }
  return randomBetween(min, max);
}

export function isTickerMode(params: GenerationParams): boolean {
  return params.minLen <= 4 && params.maxLen <= 4;
}

export function innerLengthBudget(params: GenerationParams): {
  min: number;
  max: number;
} {
  const pad = params.prefix.length + params.suffix.length;
  return {
    min: Math.max(1, params.minLen - pad),
    max: Math.max(1, params.maxLen - pad),
  };
}
