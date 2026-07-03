import type { GenerationParams } from "@/lib/types";

export type GeneratorPreset = {
  id: string;
  label: string;
  description: string;
  patch: Partial<GenerationParams>;
};

export const GENERATOR_PRESETS: GeneratorPreset[] = [
  {
    id: "brandable",
    label: "Brandable",
    description: "Short, pronounceable 2-syllable words",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 10,
      syllableCount: { min: 2, max: 2 },
      dictionaryWeight: 0,
      compound: false,
      languageWeights: { english: 100, norse: 0, latin: 0, japanese: 0 },
    },
  },
  {
    id: "ticker",
    label: "Ticker",
    description: "3–4 char crypto-style handles",
    patch: {
      mode: "phonetic",
      minLen: 3,
      maxLen: 4,
      syllableCount: { min: 1, max: 1 },
      dictionaryWeight: 0,
      compound: false,
      casing: "upper",
    },
  },
  {
    id: "nordic",
    label: "Nordic Fusion",
    description: "English + Norse phoneme blend",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 12,
      syllableCount: { min: 2, max: 3 },
      dictionaryWeight: 0,
      compound: false,
      languageWeights: { english: 50, norse: 50, latin: 0, japanese: 0 },
    },
  },
  {
    id: "compound",
    label: "Compound",
    description: "Two fused pseudo-words (e.g. ZoftKeld)",
    patch: {
      mode: "phonetic",
      minLen: 6,
      maxLen: 12,
      syllableCount: { min: 2, max: 2 },
      dictionaryWeight: 0,
      compound: true,
      casing: "title",
    },
  },
  {
    id: "hybrid",
    label: "Dict Hybrid",
    description: "30% dictionary roots + phonetic fill",
    patch: {
      mode: "phonetic",
      minLen: 6,
      maxLen: 12,
      syllableCount: { min: 2, max: 3 },
      dictionaryWeight: 30,
      compound: false,
    },
  },
  {
    id: "phrase",
    label: "Word Phrase",
    description: "BIP-39 style multi-word fusion",
    patch: {
      mode: "dictionary",
      minLen: 8,
      maxLen: 20,
      dictionaryWeight: 100,
      entropy: 65,
      compound: false,
    },
  },
];

/** Gemini-proposed presets (Phase 1 fields only). */
export const EXTENDED_GENERATOR_PRESETS: GeneratorPreset[] = [
  {
    id: "ethereal",
    label: "Ethereal",
    description: "Soft liquid endings with front vowel harmony",
    patch: {
      mode: "phonetic",
      minLen: 6,
      maxLen: 10,
      syllableCount: { min: 2, max: 3 },
      dictionaryWeight: 0,
      compound: false,
      vowelHarmony: "front",
      endingStyle: "liquid",
      moodVector: "ethereal",
      blendOverlap: false,
      clutterGuard: false,
      casing: "title",
      languageWeights: { english: 100, norse: 0, latin: 0, japanese: 0 },
    },
  },
  {
    id: "brutalist",
    label: "Brutalist Cyber",
    description: "Sharp industrial endings, clutter guard on",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 8,
      syllableCount: { min: 2, max: 2 },
      dictionaryWeight: 0,
      compound: false,
      endingStyle: "sharp",
      moodVector: "brutalist",
      clutterGuard: true,
      vowelHarmony: "off",
      blendOverlap: false,
      casing: "upper",
      languageWeights: { english: 50, norse: 50, latin: 0, japanese: 0 },
    },
  },
  {
    id: "organicCompound",
    label: "Organic Overlap",
    description: "Compound words with portmanteau letter overlap",
    patch: {
      mode: "phonetic",
      minLen: 6,
      maxLen: 11,
      syllableCount: { min: 2, max: 2 },
      dictionaryWeight: 0,
      compound: true,
      blendOverlap: true,
      endingStyle: "soft",
      vowelHarmony: "off",
      clutterGuard: false,
      casing: "title",
    },
  },
  {
    id: "grecoDeepTech",
    label: "Greco-Latin DeepTech",
    description: "Latin-heavy authoritative structures",
    patch: {
      mode: "phonetic",
      minLen: 7,
      maxLen: 12,
      syllableCount: { min: 2, max: 3 },
      dictionaryWeight: 0,
      compound: false,
      endingStyle: "soft",
      vowelHarmony: "off",
      blendOverlap: false,
      clutterGuard: false,
      casing: "lower",
      languageWeights: { english: 10, norse: 0, latin: 90, japanese: 0 },
    },
  },
  {
    id: "saasify",
    label: "SaaS Platform",
    description: "Tech affixes with moderate strictness scoring",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 9,
      syllableCount: { min: 1, max: 2 },
      dictionaryWeight: 0,
      compound: false,
      affixTier: "tech",
      affixPlacement: "suffix",
      endingStyle: "soft",
      aestheticStrictness: 1,
      clutterGuard: true,
      casing: "title",
    },
  },
  {
    id: "minimalistMora",
    label: "Minimalist Romaji",
    description: "Strict Japanese mora spacing",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 8,
      syllableCount: { min: 3, max: 4 },
      dictionaryWeight: 0,
      compound: false,
      strictMora: true,
      blueprint: "dynamic",
      languageWeights: { english: 0, norse: 0, latin: 0, japanese: 100 },
      casing: "lower",
    },
  },
  {
    id: "playfulBrand",
    label: "Playful Brand",
    description: "Warm phonetic echo with playful mood",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 9,
      syllableCount: { min: 2, max: 3 },
      dictionaryWeight: 0,
      compound: false,
      moodVector: "playful",
      phoneticEcho: true,
      echoType: "consonant",
      endingStyle: "soft",
      casing: "title",
    },
  },
  {
    id: "blueprintCvc",
    label: "CVCVC Blueprint",
    description: "Fixed consonant-vowel slot template",
    patch: {
      mode: "phonetic",
      minLen: 5,
      maxLen: 5,
      syllableCount: { min: 2, max: 2 },
      dictionaryWeight: 0,
      compound: false,
      blueprint: "cvcvc",
      aestheticStrictness: 2,
      filterCollisions: true,
      casing: "lower",
    },
  },
  {
    id: "xReady",
    label: "X / Twitter Ready",
    description: "4–15 chars for X username limits",
    patch: {
      mode: "phonetic",
      minLen: 4,
      maxLen: 15,
      syllableCount: { min: 2, max: 3 },
      dictionaryWeight: 0,
      compound: false,
      targetPlatforms: ["twitter"],
      clutterGuard: true,
      casing: "lower",
    },
  },
];

export const ALL_GENERATOR_PRESETS: GeneratorPreset[] = [
  ...GENERATOR_PRESETS,
  ...EXTENDED_GENERATOR_PRESETS,
];

export function findActivePreset(
  params: GenerationParams,
): GeneratorPreset | undefined {
  return ALL_GENERATOR_PRESETS.find((preset) =>
    matchesPreset(params, preset.patch),
  );
}

function matchesPreset(
  params: GenerationParams,
  patch: Partial<GenerationParams>,
): boolean {
  for (const [key, value] of Object.entries(patch)) {
    const current = params[key as keyof GenerationParams];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        return false;
      }
    } else if (current !== value) {
      return false;
    }
  }
  return true;
}
