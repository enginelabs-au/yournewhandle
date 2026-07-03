"use client";

import type { GenerationMode } from "@/lib/types";
import { MODE_OPTIONS } from "@/lib/matrix-validation";

type ModeToggleGroupProps = {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
};

export function ModeToggleGroup({ value, onChange }: ModeToggleGroupProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {MODE_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? "border-accent-magenta/50 bg-accent-magenta/10 shadow-[0_0_12px_rgb(224_64_251_/_0.1)]"
                  : "border-border-subtle/60 bg-panel-elevated/30 hover:border-accent-cyan/25"
              }`}
            >
              <span
                className={`block text-sm font-semibold ${
                  active ? "text-accent-magenta" : "text-zinc-200"
                }`}
              >
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                {option.description}
              </span>
            </button>
          );
        })}
    </div>
  );
}
