# Gemini Generation Feature Proposals

Source: Gemini response to `docs/gemini-generation-handover.md` (2026-07-03).

Implementation status tracked in repo; **Phase 1** (AESTH-06, AESTH-08, phonotactic rule engine, clutter guard, vowel harmony) landed in code first.

---

## Part A: Feature Backlog

### Phonetic & Prosody

#### AESTH-01: Vowel Harmony Matcher

- **Aesthetic target:** Sleek, consistent vocal resonance (e.g. velmora vs volmura).
- **Controls:** Vowel Harmony Mode (Off / Front / Back / Neutral).
- **Algorithm:** Classify nuclei into front (e, i, ae) and back (a, o, u). Subsequent syllables filter nuclei to match the first syllable.
- **Examples:** velmiren, korovona, belyxora, solvona, grendimy
- **Params:** `vowelHarmony: "off" | "front" | "back" | "neutral"`
- **Complexity:** S

#### AESTH-02: Syllabic Meter & Stress Weights

- **Aesthetic target:** Trochaic NO-va-lyx or Iambic ve-LUM cadence.
- **Controls:** Cadence Preference (Trochaic ⟷ Balanced ⟷ Iambic).
- **Params:** `cadencePreference: "trochaic" | "balanced" | "iambic"`
- **Complexity:** M

#### AESTH-03: Assonance & Alliteration Linker

- **Aesthetic target:** voxvane, frinfrinkle.
- **Controls:** Phonetic Echo toggle; Echo Type (Initial Consonant / Core Vowel).
- **Params:** `phoneticEcho: boolean`, `echoType: "consonant" | "vowel"`
- **Complexity:** S

#### AESTH-04: Sonority Sequencing Regulator

- **Aesthetic target:** Eliminate jarring clusters (rtk, vj).
- **Controls:** Pronounceability Floor slider.
- **Params:** `sonorityFloor: number`
- **Complexity:** M

### Morphology & Structure

#### AESTH-05: Affix Injection Matrix

- **Controls:** Affix Tier (Tech / Premium / Neo-Classical / Creative); Placement (Prefix / Suffix / Auto).
- **Params:** `affixTier`, `affixPlacement`
- **Complexity:** S

#### AESTH-06: Portmanteau Overlap Concat ✅ Phase 1

- **Controls:** Blend Overlap toggle.
- **Params:** `blendOverlap: boolean`
- **Examples:** prismalt, cryptonex, fluxera, aetheron, mythara

#### AESTH-07: Morphological Slot Templates

- **Controls:** Structural Blueprint (Dynamic / CVCVC / VCVCV / CVCCV).
- **Params:** `blueprint`
- **Complexity:** M

#### AESTH-08: Soft Sonorant Suffix Lock ✅ Phase 1

- **Controls:** Ending Style (Sharp / Soft / Liquid).
- **Params:** `endingStyle: "sharp" | "soft" | "liquid"`
- **Examples:** velmora, orivane, aetheron, sylphora, torvane

### Semantic & Mood

#### AESTH-09–11: Mood Vector (Ethereal / Brutalist / Playful)

- **Params:** `moodVector: "default" | "ethereal" | "brutalist" | "playful"`
- **Complexity:** M

### Cross-linguistic Fusion

#### AESTH-12–13: Greco-Latin Oracle, Romaji Mora Grid

- **Params:** extended language weights, `strictMora: boolean`

### Aesthetic Scoring & Filtering

#### AESTH-14: Markov Bigram Evaluator — Phase 2

#### AESTH-15: Clutter / Digraph Guard ✅ Phase 1

- **Params:** `clutterGuard: boolean`

#### AESTH-16: Common Word Bloom Filter — Phase 2

### Presets & Pipelines

#### AESTH-17: Platform Sweet-Spot Targeting

#### AESTH-18: Seed-Based Deterministic Generation — Phase 3

---

## Part B: Extended Presets

See `src/lib/generator-presets.ts` → `EXTENDED_GENERATOR_PRESETS`.

| Preset | Focus |
|--------|-------|
| Ethereal | soft liquid endings, front harmony |
| Brutalist Cyber | sharp endings, clutter guard |
| SaaS Platform | tech affixes (Phase 2) |
| Minimalist Romaji | strict mora (Phase 2) |
| Organic Overlap | compound + blend overlap |
| Greco-Latin DeepTech | Latin-heavy |
| Playful Brand | phonetic echo (Phase 2) |
| CVCVC Blueprint | blueprint template (Phase 2) |

---

## Part C: Aesthetic Scoring Model — Phase 2

Multi-factor score: bigram log-probability + rhythm/sonority − structural penalties.

Target file: `src/lib/engine/scoring.ts` (not yet implemented).

---

## Part D: Phonotactic Rule Engine — Phase 1 foundation

Implemented in `src/lib/engine/phonotactic/`. Pluggable rules compiled from `GenerationParams`.

---

## Part E: Roadmap Phasing

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Rule engine, soft suffix, portmanteau overlap, clutter guard, vowel harmony | ✅ Done |
| **2** | Bigram scoring, mood roots, affix matrix, blueprint, echo, mora, word filter | ✅ Done |
| **3** | Seedable RNG, platform targeting, Gemini polish API | ✅ Done |
