import {
  DEFAULT_GENERATION_PARAMS,
  LANGUAGE_IDS,
  type GenerationParams,
  type LanguageId,
} from "@/lib/types";

const STORAGE_KEY = "ynh:params:v1";

function normalizeLanguageWeights(
  weights: Partial<Record<LanguageId, number>>,
): Record<LanguageId, number> {
  const merged = { ...DEFAULT_GENERATION_PARAMS.languageWeights, ...weights };
  const total = LANGUAGE_IDS.reduce((sum, id) => sum + (merged[id] ?? 0), 0);

  if (total <= 0) {
    return { ...DEFAULT_GENERATION_PARAMS.languageWeights };
  }

  if (total === 100) {
    return merged;
  }

  const normalized = {} as Record<LanguageId, number>;
  let allocated = 0;

  LANGUAGE_IDS.forEach((id, index) => {
    if (index === LANGUAGE_IDS.length - 1) {
      normalized[id] = 100 - allocated;
    } else {
      const value = Math.round(((merged[id] ?? 0) / total) * 100);
      normalized[id] = value;
      allocated += value;
    }
  });

  return normalized;
}

function mergeParams(partial: Partial<GenerationParams>): GenerationParams {
  const languageWeights = normalizeLanguageWeights(
    partial.languageWeights ?? DEFAULT_GENERATION_PARAMS.languageWeights,
  );

  return {
    ...DEFAULT_GENERATION_PARAMS,
    ...partial,
    syllableCount: {
      ...DEFAULT_GENERATION_PARAMS.syllableCount,
      ...partial.syllableCount,
    },
    languageWeights,
    allowedVowels:
      partial.allowedVowels ?? [...DEFAULT_GENERATION_PARAMS.allowedVowels],
    blockedConsonants:
      partial.blockedConsonants ?? [...DEFAULT_GENERATION_PARAMS.blockedConsonants],
    batchSize: partial.batchSize ?? DEFAULT_GENERATION_PARAMS.batchSize,
    vowelHarmony: partial.vowelHarmony ?? DEFAULT_GENERATION_PARAMS.vowelHarmony,
    blendOverlap: partial.blendOverlap ?? DEFAULT_GENERATION_PARAMS.blendOverlap,
    endingStyle: partial.endingStyle ?? DEFAULT_GENERATION_PARAMS.endingStyle,
    clutterGuard: partial.clutterGuard ?? DEFAULT_GENERATION_PARAMS.clutterGuard,
    aestheticStrictness:
      partial.aestheticStrictness ?? DEFAULT_GENERATION_PARAMS.aestheticStrictness,
    affixTier: partial.affixTier ?? DEFAULT_GENERATION_PARAMS.affixTier,
    affixPlacement:
      partial.affixPlacement ?? DEFAULT_GENERATION_PARAMS.affixPlacement,
    moodVector: partial.moodVector ?? DEFAULT_GENERATION_PARAMS.moodVector,
    phoneticEcho: partial.phoneticEcho ?? DEFAULT_GENERATION_PARAMS.phoneticEcho,
    echoType: partial.echoType ?? DEFAULT_GENERATION_PARAMS.echoType,
    blueprint: partial.blueprint ?? DEFAULT_GENERATION_PARAMS.blueprint,
    strictMora: partial.strictMora ?? DEFAULT_GENERATION_PARAMS.strictMora,
    filterCollisions:
      partial.filterCollisions ?? DEFAULT_GENERATION_PARAMS.filterCollisions,
    seed: partial.seed ?? DEFAULT_GENERATION_PARAMS.seed,
    targetPlatforms:
      partial.targetPlatforms ?? [...DEFAULT_GENERATION_PARAMS.targetPlatforms],
  };
}

function parseStoredParams(raw: string): Partial<GenerationParams> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed as Partial<GenerationParams>;
  } catch {
    return null;
  }
}

export function loadParams(): GenerationParams {
  if (typeof window === "undefined") {
    return { ...DEFAULT_GENERATION_PARAMS };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...DEFAULT_GENERATION_PARAMS };
  }

  const partial = parseStoredParams(raw);
  if (!partial) {
    return { ...DEFAULT_GENERATION_PARAMS };
  }

  return mergeParams(partial);
}

export function saveParams(params: GenerationParams): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mergeParams(params)));
}

export function clearParams(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY };
