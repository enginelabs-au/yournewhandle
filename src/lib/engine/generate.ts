import type { Candidate, GenerationParams } from "@/lib/types";
import { applyCasing, constraintsSatisfiable } from "./constraints";
import { buildAffixHandle } from "./affix-handle";
import { buildBlueprintHandle } from "./blueprint";
import { buildCompoundHandle, buildLongCompoundHandle, isLongHandleTarget } from "./compound";
import { buildDictionaryHandle } from "./dictionary";
import { buildPhoneticHandle } from "./phonetic";
import { PhonotacticRuleEngine } from "./phonotactic";
import { resolveGenerationParams } from "./resolve-params";
import {
  clearSeededRng,
  createCandidateId,
  initSeededRng,
} from "./random";
import {
  minScoreThreshold,
  scoreCandidate,
  sortCandidatesByScore,
} from "./scoring";

function generateRawHandle(params: GenerationParams): string | null {
  if (isLongHandleTarget(params)) {
    const longHandle = buildLongCompoundHandle(params);
    if (longHandle) {
      return longHandle;
    }
  }

  if (params.mode === "dictionary" || params.dictionaryWeight > 0 || params.compound) {
    const dictionary = buildDictionaryHandle(params);
    if (dictionary) {
      return dictionary;
    }
  }

  if (params.blueprint !== "dynamic") {
    const blueprint = buildBlueprintHandle(params);
    if (blueprint) {
      return blueprint;
    }
  }

  if (params.affixTier !== "off") {
    const affixed = buildAffixHandle(params);
    if (affixed) {
      return affixed;
    }
  }

  if (params.compound || params.minLen > 4) {
    const compound = buildCompoundHandle(params);
    if (compound) {
      return compound;
    }
  }

  return buildPhoneticHandle(params);
}

export function generateOne(
  params: GenerationParams,
  ruleEngine?: PhonotacticRuleEngine,
): Candidate | null {
  if (!constraintsSatisfiable(params)) {
    return null;
  }

  const scoreFloor = minScoreThreshold(params);
  const maxAttempts = generateAttemptsForParams(params);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const raw = generateRawHandle(params);
    if (!raw) {
      continue;
    }

    if (ruleEngine && !ruleEngine.checkCompliance(raw)) {
      continue;
    }

    if (scoreCandidate(raw, params) < scoreFloor) {
      continue;
    }

    const handle = applyCasing(raw, params.casing);
    const normalized = handle.toLowerCase();

    return {
      id: createCandidateId(),
      handle,
      normalized,
      mode: params.mode,
    };
  }

  return null;
}

function generateAttemptsForParams(params: GenerationParams): number {
  return params.maxLen > 20 ? 12 : params.maxLen > 14 ? 8 : 5;
}

export function generateBatch(params: GenerationParams): Candidate[] {
  initSeededRng(params.seed);
  try {
    const effective = resolveGenerationParams(params);
    const seen = new Set<string>();
    const results: Candidate[] = [];
    const ruleEngine = new PhonotacticRuleEngine(effective);
    const strictnessMultiplier =
      effective.aestheticStrictness > 0 || effective.filterCollisions ? 10 : 5;
    const lengthFactor =
      effective.maxLen > 20 ? 4 : effective.maxLen > 14 ? 2 : 1;
    const maxAttempts =
      effective.batchSize *
      (effective.clutterGuard ? 8 : strictnessMultiplier) *
      lengthFactor;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (results.length >= effective.batchSize) {
        break;
      }

      const candidate = generateOne(effective, ruleEngine);
      if (!candidate) {
        continue;
      }

      if (seen.has(candidate.normalized)) {
        continue;
      }

      seen.add(candidate.normalized);
      results.push(candidate);
    }

    return sortCandidatesByScore(results, effective);
  } finally {
    clearSeededRng();
  }
}

export { constraintsSatisfiable };
