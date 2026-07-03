"use client";

import type {
  AffixPlacement,
  AffixTier,
  AestheticStrictness,
  Blueprint,
  EchoType,
  EndingStyle,
  GenerationParams,
  MoodVector,
  VowelHarmony,
} from "@/lib/types";
import { SliderField } from "@/components/ui/matrix-controls";

type AestheticControlsPanelProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
};

const VOWEL_HARMONY_OPTIONS: { value: VowelHarmony; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "neutral", label: "Neutral" },
];

const ENDING_STYLE_OPTIONS: { value: EndingStyle; label: string }[] = [
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
  { value: "liquid", label: "Liquid" },
];

const MOOD_OPTIONS: { value: MoodVector; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "ethereal", label: "Ethereal" },
  { value: "brutalist", label: "Brutalist" },
  { value: "playful", label: "Playful" },
];

const AFFIX_TIER_OPTIONS: { value: AffixTier; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "tech", label: "Tech" },
  { value: "premium", label: "Premium" },
  { value: "classical", label: "Classical" },
  { value: "creative", label: "Creative" },
];

const BLUEPRINT_OPTIONS: { value: Blueprint; label: string }[] = [
  { value: "dynamic", label: "Dynamic" },
  { value: "cvcvc", label: "CVCVC" },
  { value: "vcvcv", label: "VCVCV" },
  { value: "cvccv", label: "CVCCV" },
];

const STRICTNESS_LABELS = ["Off", "Loose", "Strict"] as const;

export function AestheticControlsPanel({
  params,
  onChange,
}: AestheticControlsPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dr-border bg-dr-panel-2/40 p-3">
      <div className="space-y-2">
        <label htmlFor="mood-vector" className="text-sm font-medium text-zinc-200">
          Mood vector
        </label>
        <select
          id="mood-vector"
          value={params.moodVector}
          onChange={(event) =>
            onChange({ moodVector: event.target.value as MoodVector })
          }
          className="w-full rounded-md border border-dr-border bg-dr-panel px-2.5 py-2 text-sm text-zinc-200"
        >
          {MOOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="vowel-harmony" className="text-sm font-medium text-zinc-200">
          Vowel harmony
        </label>
        <select
          id="vowel-harmony"
          value={params.vowelHarmony}
          onChange={(event) =>
            onChange({ vowelHarmony: event.target.value as VowelHarmony })
          }
          className="w-full rounded-md border border-dr-border bg-dr-panel px-2.5 py-2 text-sm text-zinc-200"
        >
          {VOWEL_HARMONY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-zinc-200">Ending style</span>
        <div className="flex flex-wrap gap-2">
          {ENDING_STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ endingStyle: option.value })}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                params.endingStyle === option.value
                  ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                  : "border-border-subtle/60 bg-base/50 text-zinc-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="affix-tier" className="text-sm font-medium text-zinc-200">
            Affix tier
          </label>
          <select
            id="affix-tier"
            value={params.affixTier}
            onChange={(event) =>
              onChange({ affixTier: event.target.value as AffixTier })
            }
            className="w-full rounded-md border border-dr-border bg-dr-panel px-2.5 py-2 text-sm text-zinc-200"
          >
            {AFFIX_TIER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="affix-placement"
            className="text-sm font-medium text-zinc-200"
          >
            Affix placement
          </label>
          <select
            id="affix-placement"
            value={params.affixPlacement}
            disabled={params.affixTier === "off"}
            onChange={(event) =>
              onChange({
                affixPlacement: event.target.value as AffixPlacement,
              })
            }
            className="w-full rounded-md border border-dr-border bg-dr-panel px-2.5 py-2 text-sm text-zinc-200 disabled:opacity-50"
          >
            <option value="auto">Auto</option>
            <option value="prefix">Prefix</option>
            <option value="suffix">Suffix</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="blueprint" className="text-sm font-medium text-zinc-200">
          Structural blueprint
        </label>
        <select
          id="blueprint"
          value={params.blueprint}
          onChange={(event) =>
            onChange({ blueprint: event.target.value as Blueprint })
          }
          className="w-full rounded-md border border-dr-border bg-dr-panel px-2.5 py-2 text-sm text-zinc-200"
        >
          {BLUEPRINT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <SliderField
        id="aesthetic-strictness"
        label="Aesthetic strictness"
        hint={STRICTNESS_LABELS[params.aestheticStrictness]}
        min={0}
        max={2}
        step={1}
        value={params.aestheticStrictness}
        onChange={(value) =>
          onChange({ aestheticStrictness: value as AestheticStrictness })
        }
      />

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={params.phoneticEcho}
          onChange={(event) => onChange({ phoneticEcho: event.target.checked })}
          className="mt-0.5 rounded border-border-subtle bg-base accent-accent-cyan"
        />
        <span>
          <span className="block font-medium">Phonetic echo</span>
          <span className="block text-[11px] text-dr-muted">
            Alliteration / assonance across syllables (voxvane, frinfrinkle)
          </span>
        </span>
      </label>

      {params.phoneticEcho ? (
        <div className="flex flex-wrap gap-2 pl-6">
          {(["consonant", "vowel"] as EchoType[]).map((echoType) => (
            <button
              key={echoType}
              type="button"
              onClick={() => onChange({ echoType })}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                params.echoType === echoType
                  ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                  : "border-border-subtle/60 bg-base/50 text-zinc-400"
              }`}
            >
              {echoType === "consonant" ? "Initial consonant" : "Core vowel"}
            </button>
          ))}
        </div>
      ) : null}

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={params.blendOverlap}
          onChange={(event) => onChange({ blendOverlap: event.target.checked })}
          className="mt-0.5 rounded border-border-subtle bg-base accent-accent-cyan"
        />
        <span>
          <span className="block font-medium">Blend overlap</span>
          <span className="block text-[11px] text-dr-muted">
            Portmanteau merge at compound boundaries
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={params.strictMora}
          onChange={(event) => onChange({ strictMora: event.target.checked })}
          className="mt-0.5 rounded border-border-subtle bg-base accent-accent-cyan"
        />
        <span>
          <span className="block font-medium">Strict mora (Romaji)</span>
          <span className="block text-[11px] text-dr-muted">
            Japanese phonotactics — open syllables, nasal n codas only
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={params.clutterGuard}
          onChange={(event) => onChange({ clutterGuard: event.target.checked })}
          className="mt-0.5 rounded border-border-subtle bg-base accent-accent-cyan"
        />
        <span>
          <span className="block font-medium">Clutter guard</span>
          <span className="block text-[11px] text-dr-muted">
            Reject triple consonants and awkward digraph clusters
          </span>
        </span>
      </label>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={params.filterCollisions}
          onChange={(event) =>
            onChange({ filterCollisions: event.target.checked })
          }
          className="mt-0.5 rounded border-border-subtle bg-base accent-accent-cyan"
        />
        <span>
          <span className="block font-medium">Uniqueness filter</span>
          <span className="block text-[11px] text-dr-muted">
            Reject common English words (runner, cloud, etc.)
          </span>
        </span>
      </label>
    </div>
  );
}
