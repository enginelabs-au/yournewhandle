import type { EndingStyle } from "@/lib/types";

const SOFT_CODAS = new Set(["l", "n", "m", "r", "s", "th", "sh"]);
const LIQUID_CODAS = new Set(["l", "r", "n"]);
const SHARP_CODAS = new Set(["t", "d", "k", "g", "p", "x", "v", "ck", "nt", "nd"]);

function codaMatchesSet(coda: string, allowed: Set<string>): boolean {
  if (allowed.has(coda)) {
    return true;
  }
  return [...allowed].some((token) => coda.endsWith(token));
}

export function filterCodasForEnding(
  codas: readonly string[],
  endingStyle: EndingStyle,
  isFinalSyllable: boolean,
): readonly string[] {
  if (!isFinalSyllable || endingStyle === "sharp") {
    if (!isFinalSyllable || endingStyle !== "sharp") {
      return codas;
    }
    const sharp = codas.filter((coda) => codaMatchesSet(coda, SHARP_CODAS));
    return sharp.length > 0 ? sharp : codas;
  }

  if (endingStyle === "soft") {
    const soft = codas.filter((coda) => codaMatchesSet(coda, SOFT_CODAS));
    return soft.length > 0 ? soft : codas;
  }

  const liquid = codas.filter((coda) => codaMatchesSet(coda, LIQUID_CODAS));
  return liquid.length > 0 ? liquid : codas;
}

export function openSyllableRateForEnding(
  endingStyle: EndingStyle,
  isFinalSyllable: boolean,
  baseRate: number,
): number {
  if (!isFinalSyllable) {
    return baseRate;
  }
  if (endingStyle === "soft") {
    return Math.max(baseRate, 0.35);
  }
  if (endingStyle === "liquid") {
    return Math.max(baseRate, 0.5);
  }
  return Math.min(baseRate, 0.1);
}
