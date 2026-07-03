import type { GenerationParams } from "@/lib/types";
import { matchesBlueprint } from "@/lib/engine/blueprint";
import { isCommonWord } from "@/lib/engine/common-words";
import { wordPassesVowelHarmony } from "@/lib/engine/vowel-harmony";

export interface PhonotacticRule {
  id: string;
  validate: (word: string) => boolean;
}

const FORBIDDEN_CLUSTERS = ["qg", "vj", "qz", "kx", "px", "jv", "bx", "cj", "dx"];
const TRIPLE_CONSONANT = /[b-df-hj-np-tv-z]{3,}/;
const TRIPLE_VOWEL = /[aeiou]{3,}/;
const AWKWARD_DIGRAPH = /(?:bx|cj|dx|qz|qg|vj|fv|pb|td|kg)/;

export class PhonotacticRuleEngine {
  private rules: PhonotacticRule[] = [];

  constructor(params: GenerationParams) {
    this.compileRules(params);
  }

  private compileRules(params: GenerationParams) {
    this.rules.push({
      id: "SSP_GUARD",
      validate: (word) =>
        !FORBIDDEN_CLUSTERS.some((cluster) => word.includes(cluster)),
    });

    if (params.vowelHarmony !== "off") {
      this.rules.push({
        id: "VOWEL_HARMONY",
        validate: (word) => wordPassesVowelHarmony(word, params.vowelHarmony),
      });
    }

    if (params.clutterGuard) {
      this.rules.push({
        id: "CLUTTER_GUARD",
        validate: (word) =>
          !TRIPLE_CONSONANT.test(word) &&
          !TRIPLE_VOWEL.test(word) &&
          !AWKWARD_DIGRAPH.test(word),
      });
    }

    if (params.filterCollisions) {
      this.rules.push({
        id: "COMMON_WORD",
        validate: (word) => !isCommonWord(word),
      });
    }

    if (
      params.blueprint !== "dynamic" &&
      !params.prefix &&
      !params.suffix
    ) {
      const blueprint = params.blueprint;
      this.rules.push({
        id: "BLUEPRINT",
        validate: (word) => matchesBlueprint(word, blueprint),
      });
    }
  }

  checkCompliance(word: string): boolean {
    const normalized = word.toLowerCase();
    return this.rules.every((rule) => rule.validate(normalized));
  }
}

export function passesClutterGuard(word: string): boolean {
  return (
    !TRIPLE_CONSONANT.test(word) &&
    !TRIPLE_VOWEL.test(word) &&
    !AWKWARD_DIGRAPH.test(word)
  );
}
