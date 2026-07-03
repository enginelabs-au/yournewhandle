import type { GenerationParams } from "@/lib/types";
import { affixLengthBudget, applyAffixToCore, pickAffix } from "./affix";
import { buildPhoneticHandle, buildWordCore, fitToLengthRange } from "./phonetic";
import { applyPrefixSuffix } from "./constraints";

export function buildAffixHandle(params: GenerationParams): string | null {
  if (params.affixTier === "off") {
    return buildPhoneticHandle(params);
  }

  const { affix, side } = pickAffix(params.affixTier, params.affixPlacement);
  const reserved = affix.length;
  const coreMin = Math.max(2, params.minLen - reserved);
  const coreMax = Math.max(coreMin, params.maxLen - reserved);

  const coreParams: GenerationParams = {
    ...params,
    affixTier: "off",
    prefix: "",
    suffix: "",
    minLen: coreMin,
    maxLen: coreMax,
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const core = buildWordCore(coreParams);
    if (!core) {
      continue;
    }

    let combined = applyAffixToCore(core, affix, side);
    combined = applyPrefixSuffix(combined, params.prefix, params.suffix);
    const fitted = fitToLengthRange(
      combined,
      params.minLen,
      params.maxLen,
      params,
    );
    if (fitted) {
      return fitted;
    }
  }

  return buildPhoneticHandle(params);
}

export function effectiveLengthBudget(params: GenerationParams): {
  minLen: number;
  maxLen: number;
} {
  const reserve = affixLengthBudget(params.affixTier);
  return {
    minLen: Math.max(1, params.minLen - reserve),
    maxLen: Math.max(1, params.maxLen - reserve),
  };
}
