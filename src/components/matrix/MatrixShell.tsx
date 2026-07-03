"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, SlidersHorizontal } from "lucide-react";
import type { GenerationParams, GenerationMode } from "@/lib/types";
import { getMatrixErrors } from "@/lib/matrix-validation";
import { ModeToggleGroup } from "@/components/matrix/ModeToggleGroup";
import { AdvancedSliders } from "@/components/matrix/AdvancedSliders";
import { LanguageFusionPanel } from "@/components/matrix/LanguageFusionPanel";
import { CharFilterPanel } from "@/components/matrix/CharFilterPanel";
import { GeneratorPresetsPanel } from "@/components/matrix/GeneratorPresetsPanel";
import { EngineSummaryPanel } from "@/components/matrix/EngineSummaryPanel";

type MatrixShellProps = {
  params: GenerationParams;
  onParamsChange: (patch: Partial<GenerationParams>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  embedded?: boolean;
  controlsOnly?: boolean;
};

function AccordionSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-dr-border/60 bg-dr-panel-2/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-dr-muted">
          {title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-dr-muted transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <div className={`${open ? "block" : "hidden"} space-y-4 px-3 pb-3`}>
        {children}
      </div>
    </div>
  );
}

export function MatrixShell({
  params,
  onParamsChange,
  onGenerate,
  isGenerating,
  embedded = false,
  controlsOnly = false,
}: MatrixShellProps) {
  const errors = getMatrixErrors(params);
  const canGenerate = errors.length === 0 && !isGenerating;

  const handleModeChange = (mode: GenerationMode) => {
    onParamsChange({
      mode,
      dictionaryWeight: mode === "dictionary" ? 100 : params.dictionaryWeight,
    });
  };

  const controls = (
    <>
      <GeneratorPresetsPanel params={params} onChange={onParamsChange} />

      <AccordionSection title="Generation mode">
        <ModeToggleGroup value={params.mode} onChange={handleModeChange} />
      </AccordionSection>

      <AccordionSection title="Length & blend">
        <AdvancedSliders params={params} onChange={onParamsChange} />
      </AccordionSection>

      {params.mode === "phonetic" ? (
        <AccordionSection title="Language fusion">
          <LanguageFusionPanel params={params} onChange={onParamsChange} />
        </AccordionSection>
      ) : null}

      <AccordionSection title="Character filters">
        <CharFilterPanel params={params} onChange={onParamsChange} />
      </AccordionSection>

      <AccordionSection title="Output options" defaultOpen={false}>
        <div className="space-y-3 rounded-lg border border-dr-border bg-dr-panel-2/40 p-3">
          <p className="text-[11px] leading-relaxed text-dr-muted">
            Batch size, casing, and syllable structure are configured above.
            Prefix/suffix locks constrain every generated handle.
          </p>
        </div>
      </AccordionSection>

      <EngineSummaryPanel params={params} />

      {errors.length > 0 ? (
        <div
          className="rounded-lg border border-dr-red/40 bg-dr-red/10 px-3 py-2 text-sm text-dr-red"
          role="alert"
        >
          <p className="font-medium">Constraints unsatisfiable</p>
          <ul className="mt-1 list-inside list-disc text-xs">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {controls}
        </div>
        {!controlsOnly ? (
          <footer className="shrink-0 border-t border-dr-border p-4">
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              aria-busy={isGenerating}
              className="btn-neon-generate flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {isGenerating ? "Generating…" : "Generate Handles"}
            </button>
          </footer>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="dr-section-card flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-dr-border px-5 py-4">
        <SlidersHorizontal className="h-4 w-4 text-accent-purple" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Handle Generator
          </h2>
          <p className="text-xs text-zinc-500">
            {params.mode} · {params.minLen}–{params.maxLen} chars · batch{" "}
            {params.batchSize}
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {controls}
      </div>

      <footer className="border-t border-dr-border p-5">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          aria-busy={isGenerating}
          className="btn-neon-generate flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {isGenerating ? "Generating…" : "Generate"}
        </button>
      </footer>
    </aside>
  );
}

export function useMatrixCanGenerate(params: GenerationParams, isGenerating: boolean) {
  return getMatrixErrors(params).length === 0 && !isGenerating;
}
