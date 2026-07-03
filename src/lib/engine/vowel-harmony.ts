import type { VowelHarmony } from "@/lib/types";

const FRONT_VOWELS = new Set(["e", "i", "ae", "ea", "io", "ai"]);
const BACK_VOWELS = new Set(["a", "o", "u", "oo", "ou"]);

export type VowelClass = "front" | "back" | "neutral";

export function classifyNucleus(nucleus: string): VowelClass {
  const lower = nucleus.toLowerCase();
  if (FRONT_VOWELS.has(lower) || [...FRONT_VOWELS].some((v) => lower.startsWith(v))) {
    return "front";
  }
  if (BACK_VOWELS.has(lower) || [...BACK_VOWELS].some((v) => lower.startsWith(v))) {
    return "back";
  }
  return "neutral";
}

export function filterNucleiByHarmony(
  nuclei: readonly string[],
  harmony: VowelHarmony,
  anchorClass: VowelClass | null,
): readonly string[] {
  if (harmony === "off" || !anchorClass || anchorClass === "neutral") {
    return nuclei;
  }

  const target = harmony === "front" ? "front" : harmony === "back" ? "back" : null;
  if (!target) {
    return nuclei;
  }

  const filtered = nuclei.filter((nucleus) => classifyNucleus(nucleus) === target);
  return filtered.length > 0 ? filtered : nuclei;
}

export function wordPassesVowelHarmony(
  word: string,
  harmony: VowelHarmony,
): boolean {
  if (harmony === "off") {
    return true;
  }

  let hasFront = false;
  let hasBack = false;

  for (const char of word.toLowerCase()) {
    if ("ei".includes(char)) {
      hasFront = true;
    }
    if ("aou".includes(char)) {
      hasBack = true;
    }
  }

  if (harmony === "front") {
    return !hasBack;
  }
  if (harmony === "back") {
    return !hasFront;
  }

  return !(hasFront && hasBack);
}
