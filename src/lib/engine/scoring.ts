import type { GenerationParams } from "@/lib/types";

/** Compact English bigram log-probability weights (higher = more natural). */
const BIGRAM_MAP: Record<string, number> = {
  an: 0.04,
  re: 0.038,
  in: 0.036,
  er: 0.034,
  on: 0.032,
  en: 0.03,
  al: 0.028,
  ar: 0.026,
  or: 0.024,
  el: 0.022,
  le: 0.02,
  ra: 0.018,
  ro: 0.016,
  la: 0.015,
  li: 0.014,
  ne: 0.013,
  ve: 0.015,
  ly: 0.012,
  ix: 0.01,
  ex: 0.009,
  ox: 0.008,
  yx: 0.008,
  xv: -0.045,
  qg: -0.09,
  zk: -0.032,
  qz: -0.08,
  vj: -0.06,
  bx: -0.04,
  cx: -0.035,
  fx: -0.02,
  zx: -0.05,
};

const SONORITY_MAP: Record<string, number> = {
  a: 5,
  e: 5,
  i: 5,
  o: 5,
  u: 5,
  y: 4,
  l: 4,
  r: 4,
  m: 3,
  n: 3,
  s: 2,
  z: 2,
  v: 2,
  f: 2,
  h: 2,
  p: 1,
  t: 1,
  k: 1,
  b: 1,
  d: 1,
  g: 1,
  c: 1,
  j: 1,
  x: 1,
  q: 1,
};

const TRIPLE_CONSONANT = /[b-df-hj-np-tv-z]{3,}/;
const TRIPLE_VOWEL = /[aeiou]{3,}/;

export function scoreCandidate(
  handle: string,
  params: GenerationParams,
): number {
  const word = handle.toLowerCase();
  if (word.length < 2) {
    return -1;
  }

  let bigramScore = 0;
  for (let i = 0; i < word.length - 1; i += 1) {
    const bigram = word.substring(i, i + 2);
    const score = BIGRAM_MAP[bigram];
    bigramScore += score !== undefined ? score : -0.01;
  }
  const normalizedBigram = bigramScore / (word.length - 1);

  let patternAlternations = 0;
  let lastType: "V" | "C" | null = null;
  for (const char of word) {
    const isVowel = "aeiou".includes(char);
    const currentType = isVowel ? "V" : "C";
    if (lastType && currentType !== lastType) {
      patternAlternations += 1;
    }
    lastType = currentType;
  }
  const rhythmScore = patternAlternations / word.length;

  let penalty = 0;
  if (TRIPLE_CONSONANT.test(word)) {
    penalty += 0.3;
  }
  if (TRIPLE_VOWEL.test(word)) {
    penalty += 0.4;
  }
  const lastChar = word[word.length - 1]!;
  if (lastChar === "q" || lastChar === "j") {
    penalty += 0.2;
  }

  const wp = params.aestheticStrictness === 2 ? 1.5 : 1.0;
  return wp * normalizedBigram + rhythmScore - penalty;
}

export function minScoreThreshold(params: GenerationParams): number {
  switch (params.aestheticStrictness) {
    case 2:
      return 0.005;
    case 1:
      return -0.015;
    default:
      return -Infinity;
  }
}

export function sortCandidatesByScore<T extends { normalized: string }>(
  candidates: T[],
  params: GenerationParams,
): T[] {
  if (params.aestheticStrictness === 0) {
    return candidates;
  }
  return [...candidates].sort(
    (a, b) =>
      scoreCandidate(b.normalized, params) - scoreCandidate(a.normalized, params),
  );
}
