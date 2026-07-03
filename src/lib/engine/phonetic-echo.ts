import type { EchoType } from "@/lib/types";

export type EchoAnchor = {
  type: EchoType;
  value: string;
};

export function extractEchoAnchor(
  syllable: string,
  echoType: EchoType,
): EchoAnchor | null {
  const lower = syllable.toLowerCase();
  const vowelMatch = lower.match(/[aeiou]/);
  if (echoType === "vowel" && vowelMatch) {
    return { type: "vowel", value: vowelMatch[0]! };
  }

  const consonantMatch = lower.match(/^[b-df-hj-np-tv-z]+/);
  if (echoType === "consonant" && consonantMatch) {
    return { type: "consonant", value: consonantMatch[0]!.charAt(0) };
  }

  return null;
}

export function filterOnsetsByEcho(
  onsets: readonly string[],
  anchor: EchoAnchor,
): readonly string[] {
  if (anchor.type !== "consonant") {
    return onsets;
  }
  const matched = onsets.filter((onset) =>
    onset.toLowerCase().startsWith(anchor.value),
  );
  return matched.length > 0 ? matched : onsets;
}

export function filterNucleiByEcho(
  nuclei: readonly string[],
  anchor: EchoAnchor,
): readonly string[] {
  if (anchor.type !== "vowel") {
    return nuclei;
  }
  const matched = nuclei.filter((nucleus) =>
    nucleus.toLowerCase().startsWith(anchor.value),
  );
  return matched.length > 0 ? matched : nuclei;
}

import { randomChance } from "./random";

export function shouldApplyEcho(syllableIndex: number, enabled: boolean): boolean {
  return enabled && syllableIndex > 0 && randomChance(0.6);
}
