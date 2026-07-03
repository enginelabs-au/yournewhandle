"use client";

import type { GenerationParams } from "@/lib/types";
import { GENERATOR_PRESETS } from "@/lib/generator-presets";
import { MatrixSection } from "@/components/ui/matrix-controls";

type GeneratorPresetsPanelProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
};

export function GeneratorPresetsPanel({
  params,
  onChange,
}: GeneratorPresetsPanelProps) {
  const activePreset = GENERATOR_PRESETS.find((preset) =>
    matchesPreset(params, preset.patch),
  );

  return (
    <MatrixSection title="Quick presets">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {GENERATOR_PRESETS.map((preset) => {
          const active = activePreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => onChange(preset.patch)}
              className={`rounded-lg border px-2.5 py-2 text-left transition ${
                active
                  ? "border-dr-purple-light/50 bg-dr-purple/15"
                  : "border-dr-border bg-dr-panel-2/60 hover:border-dr-blue/30"
              }`}
            >
              <span
                className={`block text-xs font-semibold ${
                  active ? "text-dr-purple-light" : "text-zinc-200"
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
    </MatrixSection>
  );
}

function matchesPreset(
  params: GenerationParams,
  patch: Partial<GenerationParams>,
): boolean {
  for (const [key, value] of Object.entries(patch)) {
    const current = params[key as keyof GenerationParams];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (JSON.stringify(current) !== JSON.stringify(value)) {
        return false;
      }
    } else if (current !== value) {
      return false;
    }
  }
  return true;
}
