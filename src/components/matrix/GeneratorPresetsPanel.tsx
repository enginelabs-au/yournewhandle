"use client";

import type { GenerationParams } from "@/lib/types";
import {
  EXTENDED_GENERATOR_PRESETS,
  findActivePreset,
  GENERATOR_PRESETS,
} from "@/lib/generator-presets";
import { MatrixAccordion } from "@/components/matrix/MatrixAccordion";

type GeneratorPresetsPanelProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
  shufflePresetId?: string | null;
};

export function GeneratorPresetsPanel({
  params,
  onChange,
  shufflePresetId = null,
}: GeneratorPresetsPanelProps) {
  const activePreset = findActivePreset(params);
  const activeAesthetic = EXTENDED_GENERATOR_PRESETS.find(
    (preset) => preset.id === activePreset?.id,
  );

  return (
    <div className="space-y-3">
      <PresetGrid
        presets={GENERATOR_PRESETS}
        activePresetId={activePreset?.id}
        shufflePresetId={shufflePresetId}
        onChange={onChange}
      />

      <MatrixAccordion
        title="Aesthetic presets"
        subtitle={activeAesthetic?.label ?? "Optional style templates"}
        defaultOpen={false}
        nested
      >
        <PresetGrid
          presets={EXTENDED_GENERATOR_PRESETS}
          activePresetId={activePreset?.id}
          shufflePresetId={shufflePresetId}
          onChange={onChange}
        />
      </MatrixAccordion>
    </div>
  );
}

function PresetGrid({
  presets,
  activePresetId,
  shufflePresetId,
  onChange,
  className = "",
}: {
  presets: typeof GENERATOR_PRESETS;
  activePresetId?: string;
  shufflePresetId?: string | null;
  onChange: (patch: Partial<GenerationParams>) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${className}`}>
      {presets.map((preset) => {
        const active = activePresetId === preset.id;
        const shuffling = shufflePresetId === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            title={preset.description}
            onClick={() => onChange(preset.patch)}
            className={`rounded-lg border px-2.5 py-2 text-left transition ${
              shuffling
                ? "preset-shuffle-active border-dr-purple-light bg-dr-purple/25 shadow-[0_0_16px_rgb(168_85_247/0.35)]"
                : active
                  ? "border-dr-purple-light/50 bg-dr-purple/15"
                  : "border-dr-border bg-dr-panel-2/60 hover:border-dr-blue/30"
            }`}
          >
            <span
              className={`block text-xs font-semibold ${
                shuffling || active ? "text-dr-purple-light" : "text-zinc-200"
              }`}
            >
              {preset.label}
            </span>
            <span className="mt-0.5 block text-[10px] leading-snug text-dr-muted">
              {preset.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
