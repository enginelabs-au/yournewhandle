import type { GenerationParams } from "@/lib/types";
import { applyPrefixSuffix } from "./constraints";
import { buildWordCore, fitToLengthRange } from "./phonetic";

export function buildCompoundHandle(params: GenerationParams): string | null {
  const partBudget = Math.max(
    2,
    Math.floor((params.minLen + params.maxLen) / 4),
  );

  const partParams: GenerationParams = {
    ...params,
    compound: false,
    prefix: "",
    suffix: "",
    minLen: partBudget,
    maxLen: partBudget + 2,
    syllableCount: { min: 1, max: 2 },
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const partA = buildWordCore(partParams, 1);
    const partB = buildWordCore(partParams, 1);

    if (!partA || !partB) {
      continue;
    }

    const combined = `${partA}${partB}`;
    const withAffixes = applyPrefixSuffix(
      combined,
      params.prefix,
      params.suffix,
    );
    return fitToLengthRange(
      withAffixes,
      params.minLen,
      params.maxLen,
      params,
    );
  }

  return null;
}
