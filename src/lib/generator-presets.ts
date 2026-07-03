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
