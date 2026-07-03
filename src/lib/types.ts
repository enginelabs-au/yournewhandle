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
};
