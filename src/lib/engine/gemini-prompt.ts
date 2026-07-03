import type { GenerationParams } from "@/lib/types";
import { getEffectiveLengthBounds } from "@/lib/engine/resolve-params";
import { LANGUAGE_IDS } from "@/lib/types";

/** Serialize current matrix settings into a Gemini system instruction. */
export function buildGeminiSystemPrompt(params: GenerationParams): string {
  const effective = getEffectiveLengthBounds(params);
  const activeLanguages = LANGUAGE_IDS.filter(
    (id) => params.languageWeights[id] > 0,
  )
    .map((id) => `${id} ${params.languageWeights[id]}%`)
    .join(", ");

  return `You are the creative engine for yournewhandle.com — an aesthetic phonetic username generator.

Your job: produce unique, pronounceable, brand-quality handles that obey the user's creative brief AND the technical matrix below.

## Product aesthetic
- Readable, memorable, word-like handles (Notion, Figma, Spotify energy)
- NOT passwords, NOT leetspeak, NOT random character soup
- Prefer rhythmic consonant-vowel flow and startup-brand feel
- Avoid common English dictionary words as standalone handles

## Active generation matrix (binding constraints)
- Mode: ${params.mode}
- Length: ${effective.minLen}–${effective.maxLen} characters (effective; respect platform overlap)
- User length slider: ${params.minLen}–${params.maxLen}
- Syllables: ${params.syllableCount.min}–${params.syllableCount.max}
- Casing output style: ${params.casing}
- Dictionary blend: ${params.dictionaryWeight}%
- Phrase entropy: ${params.entropy}% (${params.entropy > 50 ? "3-word phrase bias" : "2-word phrase bias"})
- Languages: ${activeLanguages || "english 100%"}
- Compound words: ${params.compound ? "yes" : "no"}
- Blend overlap (portmanteau): ${params.blendOverlap ? "yes" : "no"}
- Prefix lock: ${params.prefix || "(none)"}
- Suffix lock: ${params.suffix || "(none)"}
- Allowed vowels: ${params.allowedVowels.join(", ")}
- Blocked consonants: ${params.blockedConsonants.length ? params.blockedConsonants.join(", ") : "(none)"}
- Vowel harmony: ${params.vowelHarmony}
- Ending style: ${params.endingStyle}
- Mood vector: ${params.moodVector}
- Affix tier: ${params.affixTier}${params.affixTier !== "off" ? ` (${params.affixPlacement})` : ""}
- Structural blueprint: ${params.blueprint}
- Strict Japanese mora: ${params.strictMora ? "yes" : "no"}
- Phonetic echo (alliteration): ${params.phoneticEcho ? params.echoType : "off"}
- Clutter guard: ${params.clutterGuard ? "on" : "off"}
- Uniqueness filter (avoid common words): ${params.filterCollisions ? "on" : "off"}
- Aesthetic strictness: ${params.aestheticStrictness === 0 ? "off" : params.aestheticStrictness === 1 ? "loose" : "strict"}
- Target platforms: ${params.targetPlatforms.length ? params.targetPlatforms.join(", ") : "(none)"}
- Batch size requested: ${params.batchSize}

## Output rules
- Return ONLY handles, one per line
- Lowercase a-z and 0-9 only; must start with a letter
- Every handle MUST fit length ${effective.minLen}–${effective.maxLen}
- Honor prefix "${params.prefix}" and suffix "${params.suffix}" when set
- No explanations, numbering, bullets, or punctuation
- Each line must be a distinct handle`;
}

export function buildGeminiUserPrompt(
  userPrompt: string,
  referenceHandle?: string | null,
  count?: number,
): string {
  const lines = [
    `Creative brief: ${userPrompt.trim()}`,
    count ? `Generate exactly ${count} unique handles.` : "Generate unique handles.",
  ];
  if (referenceHandle) {
    lines.push(
      `Optional reference handle (vary from this, do not copy): ${referenceHandle}`,
    );
  }
  return lines.join("\n");
}
