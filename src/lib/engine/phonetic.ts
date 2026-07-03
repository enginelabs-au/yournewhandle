import type { GenerationParams, LanguageId, PhonemePool } from "@/lib/types";
import { LANGUAGE_IDS } from "@/lib/types";
import { getPool } from "@/lib/phonemes";
import {
  filterCodasForEnding,
  openSyllableRateForEnding,
} from "./ending-style";
import {
  classifyNucleus,
  filterNucleiByHarmony,
  type VowelClass,
} from "./vowel-harmony";
import { applyMoodToPool } from "./mood";
import {
  extractEchoAnchor,
  filterNucleiByEcho,
  filterOnsetsByEcho,
  shouldApplyEcho,
  type EchoAnchor,
} from "./phonetic-echo";
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

export type SyllableBuildContext = {
  isFinalSyllable: boolean;
  harmonyAnchor: VowelClass | null;
  syllableIndex: number;
  echoAnchor: EchoAnchor | null;
};

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
  const mooded = applyMoodToPool(pool, params.moodVector);
  const onsets = filterByBlocked(mooded.onsets, params.blockedConsonants);
  const nuclei = filterNuclei(mooded.nuclei, params.allowedVowels);
  let codas = filterByBlocked(mooded.codas, params.blockedConsonants);

  if (params.strictMora) {
    codas = ["", "n"];
  }

  return {
    onsets: onsets.length > 0 ? onsets : [...mooded.onsets],
    nuclei: nuclei.length > 0 ? nuclei : [...mooded.nuclei],
    codas: codas.length > 0 ? codas : [...mooded.codas],
  };
}

function resolvePoolForSyllable(
  params: GenerationParams,
  syllableIndex: number,
): PhonemePool {
  if (params.strictMora) {
    return getPool("japanese");
  }
  const lang = selectLanguageForSyllable(syllableIndex, params.languageWeights);
  return getPool(lang);
}

export function buildSyllable(
  pool: PhonemePool,
  params: GenerationParams,
  forceOpen = false,
  context?: SyllableBuildContext,
): string | null {
  const filtered = filteredPool(pool, params);
  const isFinal = context?.isFinalSyllable ?? false;
  const harmonyAnchor = context?.harmonyAnchor ?? null;

  let nuclei = filterNucleiByHarmony(
    filtered.nuclei,
    params.vowelHarmony,
    harmonyAnchor,
  );

  const codas = filterCodasForEnding(
    filtered.codas,
    params.endingStyle,
    isFinal,
  );

  const openRate = openSyllableRateForEnding(
    params.endingStyle,
    isFinal,
    params.strictMora ? 0.85 : OPEN_SYLLABLE_RATE,
  );

  let onsets = filtered.onsets;
  if (
    context &&
    params.phoneticEcho &&
    context.echoAnchor &&
    shouldApplyEcho(context.syllableIndex, true)
  ) {
    onsets = filterOnsetsByEcho(onsets, context.echoAnchor);
  }

  for (let attempt = 0; attempt < MAX_SYLLABLE_ATTEMPTS; attempt += 1) {
    const onset = pickRandom(onsets);
    let activeNuclei = nuclei;
    if (
      context &&
      params.phoneticEcho &&
      context.echoAnchor &&
      shouldApplyEcho(context.syllableIndex, true)
    ) {
      activeNuclei = filterNucleiByEcho(nuclei, context.echoAnchor);
    }
    const nucleus = pickRandom(activeNuclei);
    if (
      context &&
      params.vowelHarmony !== "off" &&
      context.harmonyAnchor === null
    ) {
      context.harmonyAnchor = classifyNucleus(nucleus);
      nuclei = filterNucleiByHarmony(
        filtered.nuclei,
        params.vowelHarmony,
        context.harmonyAnchor,
      );
    }
    if (
      context &&
      params.phoneticEcho &&
      context.syllableIndex === 0 &&
      !context.echoAnchor
    ) {
      context.echoAnchor = extractEchoAnchor(
        `${onset}${nucleus}`,
        params.echoType,
      );
    }
    const useOpen =
      forceOpen ||
      randomChance(openRate) ||
      (params.strictMora && isFinal);
    const coda = useOpen ? "" : pickRandom(codas);
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
    const lang = params.strictMora
      ? "japanese"
      : selectLanguageForSyllable(pad, params.languageWeights);
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
  const syllableContext: SyllableBuildContext = {
    isFinalSyllable: false,
    harmonyAnchor: null,
    syllableIndex: 0,
    echoAnchor: null,
  };

  for (let i = 0; i < syllableCount; i += 1) {
    syllableContext.isFinalSyllable = i === syllableCount - 1;
    syllableContext.syllableIndex = i;
    const syllable = buildSyllable(
      resolvePoolForSyllable(params, i),
      params,
      false,
      syllableContext,
    );
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
