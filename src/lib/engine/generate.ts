import type { Candidate, GenerationParams } from "@/lib/types";
import { applyCasing, constraintsSatisfiable } from "./constraints";
import { buildAffixHandle } from "./affix-handle";
import { buildBlueprintHandle } from "./blueprint";
import { buildCompoundHandle } from "./compound";
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
  if (params.mode === "dictionary") {
    return buildDictionaryHandle(params);
  }

  if (params.dictionaryWeight > 0 && params.dictionaryWeight < 100) {
    return buildDictionaryHandle(params);
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

  if (
    params.compound ||
    (params.syllableCount.min >= 2 && params.minLen > 4)
  ) {
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

  for (let attempt = 0; attempt < 5; attempt += 1) {
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

export function generateBatch(params: GenerationParams): Candidate[] {
  initSeededRng(params.seed);
  try {
    const effective = resolveGenerationParams(params);
    const seen = new Set<string>();
    const results: Candidate[] = [];
    const ruleEngine = new PhonotacticRuleEngine(effective);
    const strictnessMultiplier =
      effective.aestheticStrictness > 0 || effective.filterCollisions ? 10 : 5;
    const maxAttempts =
      effective.batchSize * (effective.clutterGuard ? 8 : strictnessMultiplier);

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
