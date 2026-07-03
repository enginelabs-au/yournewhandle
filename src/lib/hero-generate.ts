import { generateOne } from "@/lib/engine/generate";
import { HERO_COOL_HANDLES } from "@/lib/hero-handles";
import type { GenerationParams } from "@/lib/types";

/** One pronounceable handle for the hero ticker using current matrix settings. */
export function generateHeroHandle(params: GenerationParams): string {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generateOne({
      ...params,
      batchSize: 1,
      aestheticStrictness: 0,
      filterCollisions: false,
      seed: null,
    });
    if (candidate) {
      return candidate.normalized;
    }
  }

  return HERO_COOL_HANDLES[Math.floor(Math.random() * HERO_COOL_HANDLES.length)]!;
}
