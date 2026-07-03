export type LanguageId = "english" | "norse" | "latin" | "japanese";

export type GenerationMode = "phonetic" | "dictionary";

export type CheckStatus =
  | "idle"
  | "loading"
  | "available"
  | "taken"
  | "unknown"
  | "verify"
  | "error";

export type Casing = "lower" | "title" | "upper";

export type VowelHarmony = "off" | "front" | "back" | "neutral";

export type EndingStyle = "sharp" | "soft" | "liquid";

export type MoodVector = "default" | "ethereal" | "brutalist" | "playful";

export type AffixTier = "off" | "tech" | "premium" | "classical" | "creative";

export type AffixPlacement = "prefix" | "suffix" | "auto";

export type Blueprint = "dynamic" | "cvcvc" | "vcvcv" | "cvccv";

export type EchoType = "consonant" | "vowel";

export type AestheticStrictness = 0 | 1 | 2;

export interface PhonemePool {
  onsets: readonly string[];
  nuclei: readonly string[];
  codas: readonly string[];
}

export interface GenerationParams {
  mode: GenerationMode;
  minLen: number;
  maxLen: number;
  syllableCount: { min: number; max: number };
  dictionaryWeight: number;
  entropy: number;
  languageWeights: Record<LanguageId, number>;
  compound: boolean;
  prefix: string;
  suffix: string;
  allowedVowels: string[];
  blockedConsonants: string[];
  batchSize: number;
  casing: Casing;
  /** AESTH-01: restrict vowel classes across syllables */
  vowelHarmony: VowelHarmony;
  /** AESTH-06: collapse boundary overlap in compound mode */
  blendOverlap: boolean;
  /** AESTH-08: final syllable coda character */
  endingStyle: EndingStyle;
  /** AESTH-15: reject triple consonants and awkward digraphs */
  clutterGuard: boolean;
  /** AESTH-14: 0=off, 1=loose, 2=strict bigram scoring filter */
  aestheticStrictness: AestheticStrictness;
  /** AESTH-05: startup-style affix injection */
  affixTier: AffixTier;
  affixPlacement: AffixPlacement;
  /** AESTH-09–11: semantic phoneme biasing */
  moodVector: MoodVector;
  /** AESTH-03: alliteration / assonance linker */
  phoneticEcho: boolean;
  echoType: EchoType;
  /** AESTH-07: fixed CV slot templates */
  blueprint: Blueprint;
  /** AESTH-13: Japanese mora constraints */
  strictMora: boolean;
  /** AESTH-16: reject top common English words */
  filterCollisions: boolean;
  /** AESTH-18: reproducible batch when set */
  seed: string | null;
  /** AESTH-17: intersect length with platform username limits */
  targetPlatforms: string[];
}

export interface Candidate {
  id: string;
  handle: string;
  normalized: string;
  mode: GenerationMode;
}

export interface CheckerResult {
  target: string;
  status: CheckStatus;
  message?: string;
  deepLink?: string;
  checkedAt?: number;
}

export const LANGUAGE_IDS: readonly LanguageId[] = [
  "english",
  "norse",
  "latin",
  "japanese",
] as const;

export const DEFAULT_ALLOWED_VOWELS = [
  "a",
  "e",
  "i",
  "o",
  "u",
  "ae",
  "ea",
  "io",
  "ai",
  "oo",
  "ou",
] as const;

export const DEFAULT_GENERATION_PARAMS: GenerationParams = {
  mode: "phonetic",
  minLen: 5,
  maxLen: 10,
  syllableCount: { min: 2, max: 2 },
  dictionaryWeight: 0,
  entropy: 50,
  languageWeights: {
    english: 100,
    norse: 0,
    latin: 0,
    japanese: 0,
  },
  compound: false,
  prefix: "",
  suffix: "",
  allowedVowels: [...DEFAULT_ALLOWED_VOWELS],
  blockedConsonants: [],
  batchSize: 24,
  casing: "lower",
  vowelHarmony: "off",
  blendOverlap: false,
  endingStyle: "sharp",
  clutterGuard: false,
  aestheticStrictness: 0,
  affixTier: "off",
  affixPlacement: "auto",
  moodVector: "default",
  phoneticEcho: false,
  echoType: "consonant",
  blueprint: "dynamic",
  strictMora: false,
  filterCollisions: false,
  seed: null,
  targetPlatforms: [],
};
