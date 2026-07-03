import type { MoodVector, PhonemePool } from "@/lib/types";
import { pickRandom, randomChance } from "./random";

const MOOD_ONSET_HINTS: Record<
  Exclude<MoodVector, "default">,
  readonly string[]
> = {
  ethereal: ["sylph", "myth", "lum", "aeth", "l", "r", "s", "v", "n"],
  brutalist: ["sk", "kn", "hv", "gr", "dr", "fr", "k", "x", "z", "v"],
  playful: ["b", "p", "m", "l", "k", "n", "fl", "pl", "br"],
};

const MOOD_NUCLEI_HINTS: Record<
  Exclude<MoodVector, "default">,
  readonly string[]
> = {
  ethereal: ["a", "e", "i", "ae", "ea", "io"],
  brutalist: ["a", "o", "u", "oo"],
  playful: ["a", "e", "i", "o", "ai", "ou"],
};

const MOOD_CODA_HINTS: Record<
  Exclude<MoodVector, "default">,
  readonly string[]
> = {
  ethereal: ["n", "r", "l", "s", ""],
  brutalist: ["k", "x", "t", "d", "g", "ck"],
  playful: ["n", "m", "l", "ble", "ko"],
};

function preferMoodSubset(
  items: readonly string[],
  hints: readonly string[],
  bias = 0.65,
): readonly string[] {
  const preferred = items.filter((item) =>
    hints.some(
      (hint) =>
        item === hint ||
        item.startsWith(hint) ||
        (hint.length === 1 && item.startsWith(hint)),
    ),
  );
  if (preferred.length === 0) {
    return items;
  }
  return randomChance(bias) ? preferred : items;
}

export function applyMoodToPool(
  pool: PhonemePool,
  mood: MoodVector,
): PhonemePool {
  if (mood === "default") {
    return pool;
  }

  return {
    onsets: preferMoodSubset(pool.onsets, MOOD_ONSET_HINTS[mood]),
    nuclei: preferMoodSubset(pool.nuclei, MOOD_NUCLEI_HINTS[mood]),
    codas: preferMoodSubset(pool.codas, MOOD_CODA_HINTS[mood]),
  };
}

export function moodEndingOverride(mood: MoodVector): "sharp" | "soft" | null {
  if (mood === "brutalist") {
    return "sharp";
  }
  if (mood === "ethereal") {
    return "soft";
  }
  return null;
}

export function pickMoodWeighted<T>(items: readonly T[], mood: MoodVector): T {
  if (mood === "default" || items.length <= 1) {
    return pickRandom(items);
  }
  return pickRandom(items);
}
