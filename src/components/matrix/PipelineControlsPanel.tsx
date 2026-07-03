"use client";

import { Dices, Shuffle } from "lucide-react";
import type { GenerationParams } from "@/lib/types";
import {
  TARGET_PLATFORM_OPTIONS,
  formatPlatformWindow,
} from "@/lib/platform-length-bounds";
import { getEffectiveLengthBounds } from "@/lib/engine/resolve-params";
import { randomSeedString } from "@/lib/engine/random";
import { ToggleChip } from "@/components/ui/matrix-controls";

type PipelineControlsPanelProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
};

export function PipelineControlsPanel({
  params,
  onChange,
}: PipelineControlsPanelProps) {
  const effective = getEffectiveLengthBounds(params);
  const platformWindow = formatPlatformWindow(params.targetPlatforms);

  const togglePlatform = (platformId: string) => {
    const set = new Set(params.targetPlatforms);
    if (set.has(platformId)) {
      set.delete(platformId);
    } else {
      set.add(platformId);
    }
    onChange({ targetPlatforms: [...set] });
  };

  return (
    <div className="space-y-4 rounded-lg border border-dr-border bg-dr-panel-2/40 p-3">
      <div className="space-y-2">
        <span className="text-sm font-medium text-zinc-200">
          Target platforms
        </span>
        <p className="text-[11px] text-dr-muted">
          Intersects your length slider with each platform&apos;s username limits.
          {platformWindow ? ` Overlap: ${platformWindow}.` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TARGET_PLATFORM_OPTIONS.map((platform) => (
            <ToggleChip
              key={platform.id}
              label={platform.label}
              active={params.targetPlatforms.includes(platform.id)}
              onClick={() => togglePlatform(platform.id)}
            />
          ))}
        </div>
        {params.targetPlatforms.length > 0 ? (
          <p className="text-[11px] text-dr-amber">
            Effective generation length: {effective.minLen}–{effective.maxLen}{" "}
            chars
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-zinc-200">
          Generation seed
        </span>
        <p className="text-[11px] text-dr-muted">
          Same seed + settings reproduces identical batches across sessions.
        </p>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="generation-seed" className="sr-only">
              Generation seed
            </label>
            <input
              id="generation-seed"
              type="text"
              value={params.seed ?? ""}
              placeholder="Leave empty for random"
              maxLength={32}
              onChange={(event) => {
                const seed = event.target.value;
                onChange({
                  seed: seed.trim().length > 0 ? seed.trim() : null,
                });
              }}
              className="w-full rounded-md border border-border-subtle bg-base/80 px-3 py-2 font-mono text-sm text-zinc-100 outline-none ring-accent-cyan/40 focus:ring-2"
            />
          </div>
          <button
            type="button"
            title="Randomize seed"
            onClick={() => onChange({ seed: randomSeedString() })}
            className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dr-border bg-dr-panel text-dr-muted hover:border-accent-cyan/40 hover:text-accent-cyan"
          >
            <Dices className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            title="Clear seed"
            onClick={() => onChange({ seed: null })}
            className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dr-border bg-dr-panel text-dr-muted hover:border-dr-border/80"
          >
            <Shuffle className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
