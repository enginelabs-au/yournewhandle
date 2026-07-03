import type { Blueprint, GenerationParams, PhonemePool } from "@/lib/types";
import { getPool } from "@/lib/phonemes";
import { selectLanguageForSyllable } from "./phonetic";
import {
  filterByBlocked,
  filterNuclei,
  applyPrefixSuffix,
} from "./constraints";
import { applyMoodToPool } from "./mood";
import { pickRandom } from "./random";

const BLUEPRINT_SLOTS: Record<Exclude<Blueprint, "dynamic">, readonly ("C" | "V")[]> =
  {
    cvcvc: ["C", "V", "C", "V", "C"],
    vcvcv: ["V", "C", "V", "C", "V"],
    cvccv: ["C", "V", "C", "C", "V"],
  };

function isVowelChar(char: string): boolean {
  return "aeiou".includes(char);
}

function pickConsonant(pool: PhonemePool, params: GenerationParams): string {
  const onsets = filterByBlocked(pool.onsets, params.blockedConsonants);
  const source = onsets.length > 0 ? onsets : [...pool.onsets];
  const cluster = pickRandom(source);
  return cluster.charAt(0);
}

function pickVowel(pool: PhonemePool, params: GenerationParams): string {
  const nuclei = filterNuclei(pool.nuclei, params.allowedVowels);
  const source = nuclei.length > 0 ? nuclei : [...pool.nuclei];
  const nucleus = pickRandom(source);
  return nucleus.charAt(0);
}

export function buildBlueprintHandle(params: GenerationParams): string | null {
  if (params.blueprint === "dynamic") {
    return null;
  }

  const slots = BLUEPRINT_SLOTS[params.blueprint];

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const lang = selectLanguageForSyllable(0, params.languageWeights);
    let pool = getPool(lang);
    pool = applyMoodToPool(pool, params.moodVector);

    let word = "";
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i]!;
      const char =
        slot === "C" ? pickConsonant(pool, params) : pickVowel(pool, params);
      word += char;
    }

    word = applyPrefixSuffix(word, params.prefix, params.suffix);

    if (word.length >= params.minLen && word.length <= params.maxLen) {
      return word.toLowerCase();
    }

    if (word.length < params.minLen) {
      const padLang = selectLanguageForSyllable(1, params.languageWeights);
      let padPool = applyMoodToPool(getPool(padLang), params.moodVector);
      while (word.length < params.minLen && word.length < params.maxLen) {
        word += pickVowel(padPool, params);
      }
      word = applyPrefixSuffix(word, params.prefix, params.suffix);
    }

    if (word.length >= params.minLen && word.length <= params.maxLen) {
      return word.toLowerCase();
    }
  }

  return null;
}

export function matchesBlueprint(word: string, blueprint: Blueprint): boolean {
  if (blueprint === "dynamic") {
    return true;
  }
  const slots = BLUEPRINT_SLOTS[blueprint];
  if (word.length !== slots.length) {
    return false;
  }
  const pattern = [...word.toLowerCase()]
    .map((c) => (isVowelChar(c) ? "V" : "C"))
    .join("");
  return pattern === slots.join("");
}
