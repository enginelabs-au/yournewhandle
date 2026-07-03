import type { GenerationParams, LanguageId, PhonemePool } from "@/lib/types";
import { LANGUAGE_IDS } from "@/lib/types";
import { getPool } from "@/lib/phonemes";
import {
  filterByBlocked,
  filterNuclei,
  applyPrefixSuffix,
  isTickerMode,
  resolveSyllableCount,
} from "./constraints";
import { pickRandom, randomChance } from "./random";

export const OPEN_SYLLABLE_RATE = 0.2;
const MAX_SYLLABLE_ATTEMPTS = 10;

export function selectLanguageForSyllable(
  syllableIndex: number,
  languageWeights: Record<LanguageId, number>,
): LanguageId {
  const active = LANGUAGE_IDS.filter((id) => languageWeights[id] > 0);

  if (active.length === 0) {
    return "english";
  }

  if (active.length === 1) {
    return active[0]!;
  }

  if (
    active.length === 2 &&
    languageWeights[active[0]!] === 50 &&
    languageWeights[active[1]!] === 50
  ) {
    return active[syllableIndex % 2]!;
  }

  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const id of LANGUAGE_IDS) {
    cumulative += languageWeights[id];
    if (roll < cumulative) {
      return id;
    }
  }

  return active[active.length - 1]!;
}

function filteredPool(pool: PhonemePool, params: GenerationParams): PhonemePool {
  const onsets = filterByBlocked(pool.onsets, params.blockedConsonants);
  const nuclei = filterNuclei(pool.nuclei, params.allowedVowels);
  const codas = filterByBlocked(pool.codas, params.blockedConsonants);

  return {
    onsets: onsets.length > 0 ? onsets : [...pool.onsets],
    nuclei: nuclei.length > 0 ? nuclei : [...pool.nuclei],
    codas: codas.length > 0 ? codas : [...pool.codas],
  };
}

export function buildSyllable(
  pool: PhonemePool,
  params: GenerationParams,
  forceOpen = false,
): string | null {
  const filtered = filteredPool(pool, params);

  for (let attempt = 0; attempt < MAX_SYLLABLE_ATTEMPTS; attempt += 1) {
    const onset = pickRandom(filtered.onsets);
    const nucleus = pickRandom(filtered.nuclei);
    const useOpen = forceOpen || randomChance(OPEN_SYLLABLE_RATE);
    const coda = useOpen ? "" : pickRandom(filtered.codas);
    const syllable = `${onset}${nucleus}${coda}`;

    if (syllable.length >= 2 && syllable.length <= 8) {
      return syllable;
    }
  }

  return null;
}

function dropFinalCoda(word: string): string {
  const match = word.match(/^(.*?[aeiouy]+)([^aeiouy]+)$/i);
  return match ? match[1]! : word;
}

export function fitToLengthRange(
  word: string,
  minLen: number,
  maxLen: number,
  params: GenerationParams,
): string | null {
  let result = word;

  for (let step = 0; step < 3 && result.length > maxLen; step += 1) {
    if (step === 0) {
      result = dropFinalCoda(result);
    } else if (step === 1 && result.length > maxLen) {
      const half = Math.ceil(result.length / 2);
      result = result.slice(0, half);
    } else if (result.length > maxLen) {
      result = result.slice(0, maxLen);
    }
  }

  for (let pad = 0; pad < 2 && result.length < minLen; pad += 1) {
    const lang = selectLanguageForSyllable(pad, params.languageWeights);
    const extra = buildSyllable(getPool(lang), params, true);
    if (!extra) {
      break;
    }
    result += extra;
  }

  if (result.length < minLen || result.length > maxLen) {
    return null;
  }

  return result;
}

export function buildWordCore(
  params: GenerationParams,
  syllableTarget?: number,
): string | null {
  const syllableCount = isTickerMode(params)
    ? 1
    : (syllableTarget ?? resolveSyllableCount(params));

  const syllables: string[] = [];

  for (let i = 0; i < syllableCount; i += 1) {
    const lang = selectLanguageForSyllable(i, params.languageWeights);
    const syllable = buildSyllable(getPool(lang), params);
    if (!syllable) {
      return null;
    }
    syllables.push(syllable);
  }

  let word = syllables.join("");
  word = applyPrefixSuffix(word, params.prefix, params.suffix);

  return fitToLengthRange(word, params.minLen, params.maxLen, params);
}

export function buildPhoneticHandle(params: GenerationParams): string | null {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const word = buildWordCore(params);
    if (!word) {
      continue;
    }

    if (containsBlocked(word, params)) {
      continue;
    }

    return word;
  }

  return null;
}

function containsBlocked(word: string, params: GenerationParams): boolean {
  if (params.blockedConsonants.length === 0) {
    return false;
  }
  const blocked = new Set(params.blockedConsonants.map((c) => c.toLowerCase()));
  return [...word.toLowerCase()].some((char) => blocked.has(char));
}

export function buildPhoneticFill(
  params: GenerationParams,
  length: number,
): string | null {
  const fillParams: GenerationParams = {
    ...params,
    minLen: Math.max(3, length),
    maxLen: length,
    syllableCount: { min: 1, max: Math.min(2, params.syllableCount.max) },
  };

  return buildWordCore(fillParams, 1);
}
