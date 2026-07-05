import { generateOne, generateBatch } from "@/lib/engine/generate";
import { HERO_COOL_HANDLES } from "@/lib/hero-handles";
import type { GenerationParams } from "@/lib/types";

const heroGenerationDefaults = {
  batchSize: 1,
  aestheticStrictness: 0 as const,
  filterCollisions: false,
  seed: null,
};

/** One pronounceable handle for the hero ticker using current matrix settings. */
export function generateHeroHandle(params: GenerationParams): string {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generateOne({
      ...params,
      ...heroGenerationDefaults,
    });
    if (candidate) {
      return candidate.normalized;
    }
  }

  return HERO_COOL_HANDLES[Math.floor(Math.random() * HERO_COOL_HANDLES.length)]!;
}

/** Batch of candidate handles for background hero verification. */
export function generateHeroBatch(params: GenerationParams, count: number): string[] {
  const batch = generateBatch({
    ...params,
    ...heroGenerationDefaults,
    batchSize: count,
  });

  if (batch.length > 0) {
    return batch.map((candidate) => candidate.normalized);
  }

  const fallback: string[] = [];
  const pool = [...HERO_COOL_HANDLES];
  while (fallback.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    fallback.push(pool.splice(index, 1)[0]!);
  }
  return fallback;
}
