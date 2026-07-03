import type { Candidate, GenerationParams } from "@/lib/types";
import { applyCasing, constraintsSatisfiable } from "./constraints";
import { buildCompoundHandle } from "./compound";
import { buildDictionaryHandle } from "./dictionary";
import { buildPhoneticHandle } from "./phonetic";
import { createCandidateId } from "./random";

function generateRawHandle(params: GenerationParams): string | null {
  if (params.mode === "dictionary") {
    return buildDictionaryHandle(params);
  }

  if (params.dictionaryWeight > 0 && params.dictionaryWeight < 100) {
    return buildDictionaryHandle(params);
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

export function generateOne(params: GenerationParams): Candidate | null {
  if (!constraintsSatisfiable(params)) {
    return null;
  }

  const raw = generateRawHandle(params);
  if (!raw) {
    return null;
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

export function generateBatch(params: GenerationParams): Candidate[] {
  const seen = new Set<string>();
  const results: Candidate[] = [];
  const maxAttempts = params.batchSize * 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (results.length >= params.batchSize) {
      break;
    }

    const candidate = generateOne(params);
    if (!candidate) {
      continue;
    }

    if (seen.has(candidate.normalized)) {
      continue;
    }

    seen.add(candidate.normalized);
    results.push(candidate);
  }

  return results;
}

export { constraintsSatisfiable };
