import type { GenerationParams } from "@/lib/types";
import { DEFAULT_GENERATION_PARAMS, LANGUAGE_IDS } from "@/lib/types";

type PartialGenerationBody = Partial<
  Omit<GenerationParams, "languageWeights" | "syllableCount" | "allowedVowels">
> & {
  languageWeights?: Partial<GenerationParams["languageWeights"]>;
  syllableCount?: Partial<GenerationParams["syllableCount"]>;
  allowedVowels?: string[];
  batchSize?: number;
  count?: number;
};

export function parseGenerationBody(
  body: PartialGenerationBody | undefined,
  maxBatch: number,
): GenerationParams | { error: string } {
  if (!body || typeof body !== "object") {
    return { ...DEFAULT_GENERATION_PARAMS, batchSize: Math.min(12, maxBatch) };
  }

  const batchSize = Math.min(
    maxBatch,
    Math.max(1, Math.floor(body.batchSize ?? body.count ?? 12)),
  );

  const minLen = clampInt(body.minLen ?? DEFAULT_GENERATION_PARAMS.minLen, 4, 30);
  const maxLen = clampInt(body.maxLen ?? DEFAULT_GENERATION_PARAMS.maxLen, 4, 30);

  if (minLen > maxLen) {
    return { error: "minLen cannot exceed maxLen" };
  }

  const languageWeights = { ...DEFAULT_GENERATION_PARAMS.languageWeights };
  if (body.languageWeights) {
    for (const lang of LANGUAGE_IDS) {
      if (typeof body.languageWeights[lang] === "number") {
        languageWeights[lang] = clampInt(body.languageWeights[lang], 0, 100);
      }
    }
  }

  const syllableCount = {
    min: clampInt(
      body.syllableCount?.min ?? DEFAULT_GENERATION_PARAMS.syllableCount.min,
      1,
      6,
    ),
    max: clampInt(
      body.syllableCount?.max ?? DEFAULT_GENERATION_PARAMS.syllableCount.max,
      1,
      6,
    ),
  };

  if (syllableCount.min > syllableCount.max) {
    return { error: "syllableCount.min cannot exceed syllableCount.max" };
  }

  return {
    mode: body.mode === "dictionary" ? "dictionary" : "phonetic",
    minLen,
    maxLen,
    syllableCount,
    dictionaryWeight: clampInt(
      body.dictionaryWeight ?? DEFAULT_GENERATION_PARAMS.dictionaryWeight,
      0,
      100,
    ),
    entropy: clampInt(body.entropy ?? DEFAULT_GENERATION_PARAMS.entropy, 0, 100),
    languageWeights,
    compound: body.compound ?? DEFAULT_GENERATION_PARAMS.compound,
    prefix: sanitizeAffix(body.prefix),
    suffix: sanitizeAffix(body.suffix),
    allowedVowels:
      body.allowedVowels?.length && Array.isArray(body.allowedVowels)
        ? body.allowedVowels.map(String)
        : [...DEFAULT_GENERATION_PARAMS.allowedVowels],
    blockedConsonants: Array.isArray(body.blockedConsonants)
      ? body.blockedConsonants.map(String)
      : [],
    batchSize,
    casing:
      body.casing === "title" || body.casing === "upper"
        ? body.casing
        : "lower",
    vowelHarmony: validVowelHarmony(body.vowelHarmony),
    blendOverlap: Boolean(body.blendOverlap),
    endingStyle: validEndingStyle(body.endingStyle),
    clutterGuard: Boolean(body.clutterGuard),
    aestheticStrictness: validStrictness(body.aestheticStrictness),
    affixTier: validAffixTier(body.affixTier),
    affixPlacement: validAffixPlacement(body.affixPlacement),
    moodVector: validMood(body.moodVector),
    phoneticEcho: Boolean(body.phoneticEcho),
    echoType: body.echoType === "vowel" ? "vowel" : "consonant",
    blueprint: validBlueprint(body.blueprint),
    strictMora: Boolean(body.strictMora),
    filterCollisions: Boolean(body.filterCollisions),
    seed: typeof body.seed === "string" ? body.seed : null,
    targetPlatforms: Array.isArray(body.targetPlatforms)
      ? body.targetPlatforms.map(String)
      : [],
  };
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(Number(value) || min)));
}

function sanitizeAffix(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 8);
}

function validVowelHarmony(
  value: unknown,
): GenerationParams["vowelHarmony"] {
  if (value === "front" || value === "back" || value === "neutral") {
    return value;
  }
  return "off";
}

function validEndingStyle(value: unknown): GenerationParams["endingStyle"] {
  if (value === "soft" || value === "liquid") {
    return value;
  }
  return "sharp";
}

function validStrictness(value: unknown): GenerationParams["aestheticStrictness"] {
  if (value === 1 || value === 2) {
    return value;
  }
  return 0;
}

function validAffixTier(value: unknown): GenerationParams["affixTier"] {
  if (
    value === "tech" ||
    value === "premium" ||
    value === "classical" ||
    value === "creative"
  ) {
    return value;
  }
  return "off";
}

function validAffixPlacement(value: unknown): GenerationParams["affixPlacement"] {
  if (value === "prefix" || value === "suffix") {
    return value;
  }
  return "auto";
}

function validMood(value: unknown): GenerationParams["moodVector"] {
  if (value === "ethereal" || value === "brutalist" || value === "playful") {
    return value;
  }
  return "default";
}

function validBlueprint(value: unknown): GenerationParams["blueprint"] {
  if (value === "cvcvc" || value === "vcvcv" || value === "cvccv") {
    return value;
  }
  return "dynamic";
}
