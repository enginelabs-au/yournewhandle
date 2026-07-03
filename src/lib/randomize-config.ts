import {
  ALL_GENERATOR_PRESETS,
  findActivePreset,
  type GeneratorPreset,
} from "@/lib/generator-presets";
import { TARGET_PLATFORM_OPTIONS } from "@/lib/platform-length-bounds";
import { LANGUAGE_LABELS } from "@/lib/matrix-validation";
import {
  DEFAULT_ALLOWED_VOWELS,
  DEFAULT_GENERATION_PARAMS,
  LANGUAGE_IDS,
  type AffixPlacement,
  type AffixTier,
  type AestheticStrictness,
  type Blueprint,
  type Casing,
  type EchoType,
  type EndingStyle,
  type GenerationParams,
  type GenerationMode,
  type LanguageId,
  type MoodVector,
  type VowelHarmony,
} from "@/lib/types";
import { isMatrixValid } from "@/lib/matrix-validation";

const USED_CONFIGS_KEY = "ynh:used-random-configs:v1";
const MAX_PICK_ATTEMPTS = 400;

const BATCH_SIZES = [6, 12, 18, 24, 30, 36, 42, 48] as const;
const LENGTH_PAIRS: Array<[number, number]> = [
  [3, 4],
  [3, 6],
  [4, 8],
  [5, 10],
  [5, 12],
  [6, 10],
  [6, 12],
  [7, 12],
  [8, 15],
  [8, 20],
  [10, 20],
  [4, 15],
];

const VOWEL_HARMONY: VowelHarmony[] = ["off", "front", "back", "neutral"];
const ENDING_STYLES: EndingStyle[] = ["sharp", "soft", "liquid"];
const MOODS: MoodVector[] = ["default", "ethereal", "brutalist", "playful"];
const AFFIX_TIERS: AffixTier[] = [
  "off",
  "tech",
  "premium",
  "classical",
  "creative",
];
const AFFIX_PLACEMENTS: AffixPlacement[] = ["auto", "prefix", "suffix"];
const BLUEPRINTS: Blueprint[] = ["dynamic", "cvcvc", "vcvcv", "cvccv"];
const CASINGS: Casing[] = ["lower", "title", "upper"];
const ECHO_TYPES: EchoType[] = ["consonant", "vowel"];
const STRICTNESS: AestheticStrictness[] = [0, 1, 2];
const CONSONANT_BLOCKS = ["q", "x", "z", "j", "v"] as const;

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function pick<T>(items: readonly T[]): T {
  return items[randInt(items.length)]!;
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

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

export function mergeToFullParams(
  partial: Partial<GenerationParams>,
): GenerationParams {
  return {
    ...DEFAULT_GENERATION_PARAMS,
    ...partial,
    syllableCount: {
      ...DEFAULT_GENERATION_PARAMS.syllableCount,
      ...partial.syllableCount,
    },
    languageWeights: normalizeLanguageWeights(
      partial.languageWeights ?? DEFAULT_GENERATION_PARAMS.languageWeights,
    ),
    allowedVowels: partial.allowedVowels
      ? [...partial.allowedVowels]
      : [...DEFAULT_ALLOWED_VOWELS],
    blockedConsonants: partial.blockedConsonants
      ? [...partial.blockedConsonants]
      : [],
    targetPlatforms: partial.targetPlatforms
      ? [...partial.targetPlatforms]
      : [],
    seed: partial.seed ?? null,
  };
}

export type LengthConstraint = {
  minLen: number;
  maxLen: number;
};

/** Pin min/max length and keep syllable count compatible with the range. */
export function applyLengthConstraint(
  params: GenerationParams,
  constraint: LengthConstraint,
): GenerationParams {
  const minLen = constraint.minLen;
  const maxLen = Math.max(minLen, constraint.maxLen);
  const cap = minLen <= 4 ? 1 : maxLen <= 6 ? 2 : 4;
  const syllableMin = Math.min(params.syllableCount.min, cap);
  const syllableMax = Math.min(Math.max(syllableMin, params.syllableCount.max), cap);

  return {
    ...params,
    minLen,
    maxLen,
    syllableCount: {
      min: syllableMin,
      max: Math.max(syllableMin, syllableMax),
    },
  };
}

export function configFingerprint(params: GenerationParams): string {
  const canonical = {
    ...params,
    allowedVowels: [...params.allowedVowels].sort(),
    blockedConsonants: [...params.blockedConsonants].sort(),
    targetPlatforms: [...params.targetPlatforms].sort(),
  };
  return JSON.stringify(canonical);
}

export function loadUsedConfigFingerprints(): Set<string> {
  if (typeof sessionStorage === "undefined") {
    return new Set();
  }
  try {
    const raw = sessionStorage.getItem(USED_CONFIGS_KEY);
    if (!raw) {
      return new Set();
    }
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function rememberConfigFingerprint(fingerprint: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const used = loadUsedConfigFingerprints();
  used.add(fingerprint);
  sessionStorage.setItem(USED_CONFIGS_KEY, JSON.stringify([...used]));
}

export function clearUsedConfigFingerprints(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(USED_CONFIGS_KEY);
}

function randomLanguageWeights(): Record<LanguageId, number> {
  const count = randInt(3) + 1;
  const active = shuffle(LANGUAGE_IDS).slice(0, count);
  const raw = active.map(() => Math.random());
  const total = raw.reduce((sum, value) => sum + value, 0);
  const weights = {} as Record<LanguageId, number>;
  LANGUAGE_IDS.forEach((id) => {
    weights[id] = 0;
  });
  let allocated = 0;
  active.forEach((id, index) => {
    if (index === active.length - 1) {
      weights[id] = 100 - allocated;
    } else {
      const value = Math.round((raw[index]! / total) * 100);
      weights[id] = value;
      allocated += value;
    }
  });
  return weights;
}

function randomTargetPlatforms(): string[] {
  if (!chance(0.45)) {
    return [];
  }
  const count = randInt(3) + 1;
  return shuffle(TARGET_PLATFORM_OPTIONS.map((p) => p.id)).slice(0, count);
}

function randomSyllableCount(
  minLen: number,
  maxLen: number,
): { min: number; max: number } {
  const cap = minLen <= 4 ? 1 : maxLen <= 6 ? 2 : 4;
  const min = randInt(cap) + 1;
  const max = min + randInt(cap - min + 1);
  return { min, max: Math.min(max, cap) };
}

function applyBlueprintLengthRules(
  params: GenerationParams,
): GenerationParams {
  if (
    params.blueprint === "cvcvc" ||
    params.blueprint === "vcvcv" ||
    params.blueprint === "cvccv"
  ) {
    return { ...params, minLen: 5, maxLen: 5 };
  }
  return params;
}

function randomSeed(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i += 1) {
    result += alphabet[randInt(alphabet.length)]!;
  }
  return result;
}

function applyWordCompoundBias(params: GenerationParams): GenerationParams {
  if (params.strictMora || params.mode === "dictionary") {
    return params;
  }

  let next = { ...params, compound: true };

  if (next.dictionaryWeight < 60) {
    next.dictionaryWeight = pick([65, 75, 85, 95, 100]);
  }

  return next;
}

function mutateParams(
  base: GenerationParams,
  options?: { lockLength?: boolean },
): GenerationParams {
  let params = { ...base };

  if (!options?.lockLength && chance(0.35)) {
    const [minLen, maxLen] = pick(LENGTH_PAIRS);
    params = { ...params, minLen, maxLen };
  }

  if (params.mode === "phonetic" && chance(0.5)) {
    params = {
      ...params,
      syllableCount: randomSyllableCount(params.minLen, params.maxLen),
    };
  }

  if (chance(0.4)) {
    params = { ...params, languageWeights: randomLanguageWeights() };
  }

  if (params.mode === "phonetic") {
    if (chance(0.35)) {
      params = { ...params, vowelHarmony: pick(VOWEL_HARMONY) };
    }
    if (chance(0.35)) {
      params = { ...params, endingStyle: pick(ENDING_STYLES) };
    }
    if (chance(0.3)) {
      params = { ...params, moodVector: pick(MOODS) };
    }
    if (chance(0.25)) {
      params = { ...params, affixTier: pick(AFFIX_TIERS) };
    }
    if (params.affixTier !== "off" && chance(0.5)) {
      params = { ...params, affixPlacement: pick(AFFIX_PLACEMENTS) };
    }
    if (chance(0.2)) {
      params = { ...params, blueprint: pick(BLUEPRINTS) };
    }
    if (chance(0.08)) {
      params = {
        ...params,
        compound: false,
        blendOverlap: false,
      };
    } else if (!params.compound) {
      params = { ...params, compound: true, blendOverlap: chance(0.35) };
    } else if (chance(0.35)) {
      params = { ...params, blendOverlap: !params.blendOverlap };
    }
    if (chance(0.2)) {
      params = {
        ...params,
        phoneticEcho: !params.phoneticEcho,
        echoType: pick(ECHO_TYPES),
      };
    }
    if (chance(0.15)) {
      params = { ...params, strictMora: !params.strictMora };
      if (params.strictMora) {
        params = {
          ...params,
          languageWeights: { english: 0, norse: 0, latin: 0, japanese: 100 },
          blueprint: "dynamic",
        };
      }
    }
    if (params.dictionaryWeight < 60 && chance(0.85)) {
      params = {
        ...params,
        dictionaryWeight: pick([65, 75, 85, 95, 100]),
      };
    }
  }

  if (params.mode === "dictionary" || params.dictionaryWeight > 0) {
    if (chance(0.4)) {
      params = { ...params, entropy: pick([25, 40, 50, 65, 80]) };
    }
  }

  if (chance(0.3)) {
    params = { ...params, casing: pick(CASINGS) };
  }
  if (chance(0.3)) {
    params = { ...params, aestheticStrictness: pick(STRICTNESS) };
  }
  if (chance(0.35)) {
    params = { ...params, clutterGuard: !params.clutterGuard };
  }
  if (chance(0.25)) {
    params = { ...params, filterCollisions: !params.filterCollisions };
  }
  if (chance(0.35)) {
    params = { ...params, batchSize: pick(BATCH_SIZES) };
  }
  if (chance(0.4)) {
    params = { ...params, targetPlatforms: randomTargetPlatforms() };
  }
  if (chance(0.2)) {
    params = {
      ...params,
      prefix: chance(0.5) ? pick(["zo", "neo", "meta", "lux", ""]) : "",
      suffix: chance(0.5) ? pick(["ix", "ly", "ex", "ora", ""]) : "",
    };
  }
  if (chance(0.15)) {
    const blocked = shuffle(CONSONANT_BLOCKS).slice(0, randInt(3));
    params = { ...params, blockedConsonants: blocked };
  }

  params = { ...params, seed: chance(0.25) ? randomSeed() : null };

  if (params.mode === "dictionary") {
    params = { ...params, dictionaryWeight: 100, compound: false };
  }

  params = options?.lockLength ? params : applyBlueprintLengthRules(params);

  if (params.minLen > params.maxLen) {
    params = { ...params, maxLen: params.minLen };
  }

  return applyWordCompoundBias(params);
}

function buildCandidateConfig(options?: { lockLength?: boolean }): GenerationParams {
  const preset: GeneratorPreset = pick(ALL_GENERATOR_PRESETS);
  let params = mergeToFullParams(preset.patch);
  const mutationPasses = randInt(3) + 1;
  for (let i = 0; i < mutationPasses; i += 1) {
    params = mutateParams(params, options);
  }

  if (chance(0.12)) {
    const mode: GenerationMode = chance(0.35) ? "dictionary" : "phonetic";
    params = mergeToFullParams({
      ...params,
      mode,
      dictionaryWeight: mode === "dictionary" ? 100 : Math.max(params.dictionaryWeight, 75),
      compound: true,
    });
  }

  return applyWordCompoundBias(params);
}

export type RandomizeResult = {
  params: GenerationParams;
  fingerprint: string;
  poolReset: boolean;
};

/** Presets cycled during the shuffle animation (excludes duplicate ids). */
export function buildPresetShuffleFrames(count = 12): GeneratorPreset[] {
  const shuffled = shuffle(ALL_GENERATOR_PRESETS);
  const seen = new Set<string>();
  const frames: GeneratorPreset[] = [];
  for (const preset of shuffled) {
    if (seen.has(preset.id)) {
      continue;
    }
    seen.add(preset.id);
    frames.push(preset);
    if (frames.length >= count) {
      break;
    }
  }
  while (frames.length < count) {
    frames.push(pick(ALL_GENERATOR_PRESETS));
  }
  return frames;
}

export type ConfigurationSummary = {
  presetLabel: string | null;
  headline: string;
  chips: string[];
};

export function describeConfiguration(
  params: GenerationParams,
): ConfigurationSummary {
  const preset = findActivePreset(params);
  const activeLanguages = LANGUAGE_IDS.filter(
    (id) => params.languageWeights[id] > 0,
  );
  const languageLine = activeLanguages
    .map((id) => `${LANGUAGE_LABELS[id]} ${params.languageWeights[id]}%`)
    .join(" · ");

  const chips: string[] = [
    params.mode,
    `${params.minLen}–${params.maxLen} chars`,
    `${params.batchSize} handles`,
  ];

  if (params.mode === "phonetic") {
    chips.push(`${params.syllableCount.min}–${params.syllableCount.max} syllables`);
    if (languageLine) {
      chips.push(languageLine);
    }
    if (params.moodVector !== "default") {
      chips.push(`${params.moodVector} mood`);
    }
    if (params.compound) {
      chips.push("compound");
    }
    if (params.vowelHarmony !== "off") {
      chips.push(`${params.vowelHarmony} vowels`);
    }
    if (params.affixTier !== "off") {
      chips.push(`${params.affixTier} affix`);
    }
    if (params.blueprint !== "dynamic") {
      chips.push(params.blueprint.toUpperCase());
    }
  } else {
    chips.push(`${params.dictionaryWeight}% dictionary`);
  }

  if (params.targetPlatforms.length > 0) {
    chips.push(params.targetPlatforms.join(", "));
  }
  if (params.casing !== "lower") {
    chips.push(`${params.casing} case`);
  }

  const headline = preset
    ? `${preset.label} + tweaks`
    : `${params.mode} configuration`;

  return {
    presetLabel: preset?.label ?? null,
    headline,
    chips: chips.slice(0, 8),
  };
}

export function pickUniqueRandomConfiguration(options?: {
  lengthConstraint?: LengthConstraint;
}): RandomizeResult {
  const lockLength = Boolean(options?.lengthConstraint);
  const buildOptions = { lockLength };

  const finalize = (params: GenerationParams): GenerationParams =>
    options?.lengthConstraint
      ? applyLengthConstraint(params, options.lengthConstraint)
      : params;

  let used = loadUsedConfigFingerprints();
  let poolReset = false;

  for (let attempt = 0; attempt < MAX_PICK_ATTEMPTS; attempt += 1) {
    let params = finalize(buildCandidateConfig(buildOptions));
    if (!isMatrixValid(params)) {
      continue;
    }
    const fingerprint = configFingerprint(params);
    if (!used.has(fingerprint)) {
      rememberConfigFingerprint(fingerprint);
      return { params, fingerprint, poolReset };
    }
  }

  clearUsedConfigFingerprints();
  poolReset = true;
  used = new Set();

  for (let attempt = 0; attempt < MAX_PICK_ATTEMPTS; attempt += 1) {
    let params = finalize(buildCandidateConfig(buildOptions));
    if (!isMatrixValid(params)) {
      continue;
    }
    const fingerprint = configFingerprint(params);
    if (!used.has(fingerprint)) {
      rememberConfigFingerprint(fingerprint);
      return { params, fingerprint, poolReset };
    }
  }

  let fallback = finalize(mergeToFullParams(pick(ALL_GENERATOR_PRESETS).patch));
  const fingerprint = configFingerprint(fallback);
  rememberConfigFingerprint(fingerprint);
  return { params: fallback, fingerprint, poolReset: true };
}
