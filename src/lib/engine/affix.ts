import type { AffixPlacement, AffixTier } from "@/lib/types";
import { randomChance, pickRandom } from "./random";

type AffixSet = {
  prefixes: readonly string[];
  suffixes: readonly string[];
};

const AFFIX_TIERS: Record<Exclude<AffixTier, "off">, AffixSet> = {
  tech: {
    prefixes: ["un", "neo", "meta", "hyper"],
    suffixes: ["ify", "ly", "ex", "io", "hub", "base"],
  },
  premium: {
    prefixes: ["lux", "ver", "prime", "aura"],
    suffixes: ["ora", "ium", "ence", "elle", "ova"],
  },
  classical: {
    prefixes: ["aeth", "myth", "neo", "proto"],
    suffixes: ["on", "os", "is", "ae", "us"],
  },
  creative: {
    prefixes: ["lum", "vox", "syn", "pix"],
    suffixes: ["ko", "oi", "ble", "ix", "ara"],
  },
};

export function pickAffix(
  tier: Exclude<AffixTier, "off">,
  placement: AffixPlacement,
): { affix: string; side: "prefix" | "suffix" } {
  const set = AFFIX_TIERS[tier];
  const usePrefix =
    placement === "prefix" ||
    (placement === "auto" && randomChance(0.35));

  if (usePrefix) {
    const affix = pickRandom(set.prefixes);
    return { affix, side: "prefix" };
  }

  const affix = pickRandom(set.suffixes);
  return { affix, side: "suffix" };
}

export function affixLengthBudget(tier: AffixTier): number {
  if (tier === "off") {
    return 0;
  }
  return 4;
}

export function applyAffixToCore(
  core: string,
  affix: string,
  side: "prefix" | "suffix",
): string {
  return side === "prefix" ? `${affix}${core}` : `${core}${affix}`;
}
