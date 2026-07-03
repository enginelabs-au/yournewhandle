import {
  DEFAULT_ALLOWED_VOWELS,
  LANGUAGE_IDS,
  type GenerationParams,
  type LanguageId,
} from "@/lib/types";
import { constraintsSatisfiable } from "@/lib/engine/constraints";
import {
  LENGTH_INPUT_MAX,
  LENGTH_INPUT_MIN,
} from "@/lib/length-bounds";

export function languageWeightTotal(
  weights: Record<LanguageId, number>,
): number {
  return LANGUAGE_IDS.reduce((sum, id) => sum + weights[id], 0);
}

export function getMatrixErrors(params: GenerationParams): string[] {
  const errors: string[] = [];

  if (params.minLen > params.maxLen) {
    errors.push("Minimum length cannot exceed maximum length.");
  }

  if (params.minLen < LENGTH_INPUT_MIN || params.maxLen > LENGTH_INPUT_MAX) {
    errors.push(
      `Length must stay within ${LENGTH_INPUT_MIN}–${LENGTH_INPUT_MAX} characters.`,
    );
  }

  if (!constraintsSatisfiable(params)) {
    errors.push(
      "Constraints unsatisfiable: prefix and suffix exceed the max length.",
    );
  }

  const innerMax =
    params.maxLen - params.prefix.length - params.suffix.length;
  if (innerMax < 1) {
    errors.push("Prefix and suffix leave no room for generated characters.");
  }

  const weightTotal = languageWeightTotal(params.languageWeights);
  if (weightTotal !== 100) {
    errors.push(
      `Language weights must sum to 100% (currently ${weightTotal}%).`,
    );
  }

  const activeLanguages = LANGUAGE_IDS.filter(
    (id) => params.languageWeights[id] > 0,
  );
  if (params.mode === "phonetic" && activeLanguages.length === 0) {
    errors.push("Enable at least one language for phonetic generation.");
  }

  if (params.allowedVowels.length === 0) {
    errors.push("Allow at least one vowel.");
  }

  if (
    params.syllableCount.min > params.syllableCount.max ||
    params.syllableCount.min < 1 ||
    params.syllableCount.max > 4
  ) {
    errors.push("Syllable count must be between 1 and 4.");
  }

  if (params.prefix && !/^[a-zA-Z]*$/.test(params.prefix)) {
    errors.push("Prefix must use letters only.");
  }

  if (params.suffix && !/^[a-zA-Z]*$/.test(params.suffix)) {
    errors.push("Suffix must use letters only.");
  }

  return errors;
}

export function isMatrixValid(params: GenerationParams): boolean {
  return getMatrixErrors(params).length === 0;
}

export const VOWEL_OPTIONS = [...DEFAULT_ALLOWED_VOWELS];

export const CONSONANT_OPTIONS = [
  "b",
  "c",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "q",
  "r",
  "s",
  "t",
  "v",
  "w",
  "x",
  "z",
] as const;

export const LANGUAGE_LABELS: Record<LanguageId, string> = {
  english: "English",
  norse: "Norse",
  latin: "Latin",
  japanese: "Japanese",
};

export const MODE_OPTIONS: {
  value: GenerationParams["mode"];
  label: string;
  description: string;
}[] = [
  {
    value: "phonetic",
    label: "Phonetic",
    description: "Word-like syllable synthesis",
  },
  {
    value: "dictionary",
    label: "Dict Fusion",
    description: "BIP-39 style phrase fusion",
  },
];

export const CASING_OPTIONS: {
  value: GenerationParams["casing"];
  label: string;
}[] = [
  { value: "lower", label: "lower" },
  { value: "title", label: "Title" },
  { value: "upper", label: "UPPER" },
];
