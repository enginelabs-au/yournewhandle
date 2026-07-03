import type { GenerationParams } from "@/lib/types";
import { isLongHandleTarget, buildLongCompoundHandle } from "./compound";
import { applyPrefixSuffix, resolveTargetLength } from "./constraints";
import { buildPhoneticFill, buildPhoneticHandle } from "./phonetic";
import { pickRandom, randomBetween, shuffle } from "./random";
import { BIP39_SUBSET, MEDIUM_ROOTS, SHORT_ROOTS } from "./dictionary-words";

const ROOT_POOL = [...SHORT_ROOTS, ...MEDIUM_ROOTS] as const;

function pickRoots(maxLen: number, pool: readonly string[]): string {
  const candidates = pool.filter((word) => word.length <= maxLen);
  if (candidates.length === 0) {
    return pickRandom(pool);
  }
  return pickRandom(candidates);
}

function pickRootsUpToLength(maxLen: number): string {
  let chosen = pickRoots(maxLen, SHORT_ROOTS);
  if (chosen.length <= maxLen) {
    return chosen;
  }
  chosen = pickRoots(maxLen, MEDIUM_ROOTS);
  return chosen.slice(0, maxLen);
}

/** Join 2+ curated dictionary roots into one handle (no phonetic filler). */
export function buildRootCompoundHandle(
  params: GenerationParams,
): string | null {
  const affixLen = params.prefix.length + params.suffix.length;
  const innerMin = Math.max(1, params.minLen - affixLen);
  const innerMax = params.maxLen - affixLen;

  if (innerMax < 4) {
    return null;
  }

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const targetLen = randomBetween(innerMin, innerMax);
    const wordCount = randomBetween(
      2,
      targetLen > 16 ? 5 : targetLen > 10 ? 4 : 3,
    );
    const words: string[] = [];
    const used = new Set<string>();
    let length = 0;

    while (words.length < wordCount && length < targetLen) {
      const remaining = targetLen - length;
      if (remaining < 2) {
        break;
      }

      const pool = ROOT_POOL.filter(
        (word) =>
          word.length >= 2 &&
          word.length <= Math.min(remaining, 10) &&
          !used.has(word),
      );

      if (pool.length === 0) {
        break;
      }

      const word = pickRandom(pool);
      used.add(word);
      words.push(word);
      length += word.length;
    }

    if (words.length < 2) {
      continue;
    }

    let combined = words.join("");
    if (combined.length > innerMax) {
      while (words.length > 2 && combined.length > innerMax) {
        words.pop();
        combined = words.join("");
      }
    }

    combined = applyPrefixSuffix(combined, params.prefix, params.suffix);
    if (combined.length >= params.minLen && combined.length <= params.maxLen) {
      return combined.toLowerCase();
    }
  }

  return null;
}

export function buildPhraseHandle(params: GenerationParams): string | null {
  const affixLen = params.prefix.length + params.suffix.length;
  const innerMax = params.maxLen - affixLen;
  const innerMin = Math.max(1, params.minLen - affixLen);
  const wordCount =
    innerMax > 20
      ? Math.min(8, Math.max(4, Math.ceil(innerMax / 5)))
      : params.entropy > 50
        ? 3
        : 2;
  const maxPerWord = Math.max(3, Math.floor(innerMax / wordCount));

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const pool = [
      ...BIP39_SUBSET.filter(
        (word) => word.length <= maxPerWord && word.length >= 3,
      ),
      ...ROOT_POOL.filter(
        (word) => word.length <= maxPerWord && word.length >= 2,
      ),
    ];
    if (pool.length < wordCount) {
      continue;
    }

    const words: string[] = [];
    const used = new Set<string>();

    while (words.length < wordCount) {
      const word = pickRandom(pool);
      if (used.has(word)) {
        continue;
      }
      used.add(word);
      words.push(word);
    }

    const joined = words.join("");
    const hyphenated = words.join("-");
    const candidates = [joined, hyphenated];

    for (const base of candidates) {
      const phrase = applyPrefixSuffix(base, params.prefix, params.suffix);
      if (phrase.length >= params.minLen && phrase.length <= params.maxLen) {
        return phrase.toLowerCase();
      }
    }

    if (innerMin <= innerMax) {
      const shortPool = SHORT_ROOTS.filter(
        (word) => word.length <= maxPerWord,
      );
      if (shortPool.length >= wordCount) {
        const shortWords = shuffle(shortPool).slice(0, wordCount);
        const shortPhrase = applyPrefixSuffix(
          shortWords.join(""),
          params.prefix,
          params.suffix,
        );
        if (
          shortPhrase.length >= params.minLen &&
          shortPhrase.length <= params.maxLen
        ) {
          return shortPhrase.toLowerCase();
        }
      }
    }
  }

  return null;
}

export function buildHybridHandle(params: GenerationParams): string | null {
  const targetLen = resolveTargetLength(params);
  const dictChars = Math.floor(targetLen * (params.dictionaryWeight / 100));

  if (dictChars <= 0) {
    return buildPhoneticHandle(params);
  }

  const root = pickRootsUpToLength(dictChars);
  const remaining = targetLen - root.length;

  if (remaining <= 0) {
    const word = applyPrefixSuffix(root, params.prefix, params.suffix);
    if (word.length >= params.minLen && word.length <= params.maxLen) {
      return word.toLowerCase();
    }
    return null;
  }

  const fillParams: GenerationParams = {
    ...params,
    prefix: "",
    suffix: "",
    minLen: remaining,
    maxLen: remaining,
  };

  const fill = buildPhoneticFill(fillParams, remaining);
  if (!fill) {
    return buildPhoneticHandle(params);
  }

  let combined = `${root}${fill}`;
  combined = applyPrefixSuffix(combined, params.prefix, params.suffix);

  if (combined.length < params.minLen || combined.length > params.maxLen) {
    return buildPhoneticHandle(params);
  }

  return combined.toLowerCase();
}

export function buildDictionaryHandle(params: GenerationParams): string | null {
  if (isLongHandleTarget(params)) {
    const longHandle = buildLongCompoundHandle(params);
    if (longHandle) {
      return longHandle;
    }
  }

  if (params.dictionaryWeight >= 40 || params.compound) {
    const roots = buildRootCompoundHandle(params);
    if (roots) {
      return roots;
    }
  }

  if (params.dictionaryWeight >= 100) {
    const phrase = buildPhraseHandle(params);
    if (phrase) {
      return phrase;
    }
    return buildRootCompoundHandle(params);
  }

  if (params.dictionaryWeight <= 0) {
    return buildPhoneticHandle(params);
  }

  const hybrid = buildHybridHandle(params);
  if (hybrid) {
    return hybrid;
  }

  return buildRootCompoundHandle(params);
}
