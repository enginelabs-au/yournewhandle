"use client";

import type { GenerationParams } from "@/lib/types";
import { LengthField, SliderField } from "@/components/ui/matrix-controls";
import { clampLengthInput } from "@/lib/length-bounds";

type AdvancedSlidersProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
};

export function AdvancedSliders({ params, onChange }: AdvancedSlidersProps) {
  const showEntropy = params.mode === "dictionary";
  const showSyllables = params.mode === "phonetic";
  const dictionaryLocked = params.mode === "dictionary";
  const dictChars = Math.floor(params.maxLen * (params.dictionaryWeight / 100));
  const isTicker = params.maxLen <= 4 && params.minLen <= 4;

  return (
    <div className="space-y-4 rounded-lg border border-dr-border bg-dr-panel-2/40 p-3">
        {isTicker ? (
          <p className="rounded-md border border-dr-amber/30 bg-dr-amber/10 px-2.5 py-2 text-[11px] text-dr-amber">
            Ticker mode — short 3–4 character handles optimized for crypto-style
            usernames.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <LengthField
            id="min-len"
            label="Min length"
            value={params.minLen}
            onChange={(minLen) => {
              const next = clampLengthInput(minLen);
              onChange({
                minLen: next,
                maxLen: Math.max(next, params.maxLen),
              });
            }}
          />
          <LengthField
            id="max-len"
            label="Max length"
            value={params.maxLen}
            onChange={(maxLen) => {
              const next = clampLengthInput(maxLen);
              onChange({
                maxLen: next,
                minLen: Math.min(params.minLen, next),
              });
            }}
          />
        </div>

        {showSyllables ? (
          <div className="grid grid-cols-2 gap-3">
            <SliderField
              id="syllable-min"
              label="Syllables min"
              min={1}
              max={4}
              value={params.syllableCount.min}
              onChange={(min) => {
                onChange({
                  syllableCount: {
                    min,
                    max: Math.max(min, params.syllableCount.max),
                  },
                });
              }}
            />
            <SliderField
              id="syllable-max"
              label="Syllables max"
              min={1}
              max={4}
              value={params.syllableCount.max}
              onChange={(max) => {
                onChange({
                  syllableCount: {
                    min: Math.min(params.syllableCount.min, max),
                    max,
                  },
                });
              }}
            />
          </div>
        ) : null}

        <SliderField
          id="dictionary-weight"
          label={
            params.mode === "phonetic" ? "Dictionary hybrid blend" : "Dictionary weight"
          }
          hint={`${dictionaryLocked ? 100 : params.dictionaryWeight}%${
            params.mode === "phonetic" && params.dictionaryWeight > 0 && params.dictionaryWeight < 100
              ? ` · ~${dictChars} dict chars`
              : ""
          }`}
          min={0}
          max={100}
          value={dictionaryLocked ? 100 : params.dictionaryWeight}
          disabled={dictionaryLocked}
          onChange={(dictionaryWeight) => onChange({ dictionaryWeight })}
        />

        {params.mode === "phonetic" &&
        params.dictionaryWeight > 0 &&
        params.dictionaryWeight < 100 ? (
          <p className="text-[11px] leading-relaxed text-dr-muted">
            At {params.maxLen} chars, ~{dictChars} characters come from dictionary
            roots and the rest from the phonetic synthesizer (e.g. catfrinkle).
          </p>
        ) : null}

        {showEntropy ? (
          <SliderField
            id="entropy"
            label="Phrase entropy"
            hint={`${params.entropy}% · ${params.entropy > 50 ? "3 words" : "2 words"}`}
            min={0}
            max={100}
            value={params.entropy}
            onChange={(entropy) => onChange({ entropy })}
          />
        ) : null}

        {params.mode === "phonetic" ? (
          <label className="flex items-start gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={params.compound}
              onChange={(event) => onChange({ compound: event.target.checked })}
              className="mt-0.5 rounded border-border-subtle bg-base accent-accent-cyan"
            />
            <span>
              <span className="block font-medium">Compound words</span>
              <span className="block text-[11px] text-dr-muted">
                Fuse two short pseudo-words (e.g. ZoftKeld)
              </span>
            </span>
          </label>
        ) : null}

        <SliderField
          id="batch-size"
          label="Batch size"
          hint={`${params.batchSize} handles`}
          min={6}
          max={48}
          step={6}
          value={params.batchSize}
          onChange={(batchSize) => onChange({ batchSize })}
        />

        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-200">Casing</span>
          <div className="flex flex-wrap gap-2">
            {(["lower", "title", "upper"] as const).map((casing) => (
              <button
                key={casing}
                type="button"
                onClick={() => onChange({ casing })}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                  params.casing === casing
                    ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                    : "border-border-subtle/60 bg-base/50 text-zinc-400"
                }`}
              >
                {casing}
              </button>
            ))}
          </div>
        </div>
    </div>
  );
}
