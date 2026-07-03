"use client";

import { useState } from "react";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import type { GenerationParams, GenerationMode } from "@/lib/types";
import { getMatrixErrors } from "@/lib/matrix-validation";
import {
  characterMenuSummary,
  enginePreviewSummary,
  generationMenuSummary,
  phoneticsMenuSummary,
  pipelineMenuSummary,
  presetsMenuSummary,
} from "@/lib/matrix-menu-summaries";
import { ModeToggleGroup } from "@/components/matrix/ModeToggleGroup";
import { AdvancedSliders } from "@/components/matrix/AdvancedSliders";
import { LanguageFusionPanel } from "@/components/matrix/LanguageFusionPanel";
import { CharFilterPanel } from "@/components/matrix/CharFilterPanel";
import { RandomizeMatrixButton } from "@/components/matrix/RandomizeMatrixButton";
import { GeneratorPresetsPanel } from "@/components/matrix/GeneratorPresetsPanel";
import { AestheticControlsPanel } from "@/components/matrix/AestheticControlsPanel";
import { PipelineControlsPanel } from "@/components/matrix/PipelineControlsPanel";
import { EngineSummaryPanel } from "@/components/matrix/EngineSummaryPanel";
import { MatrixAccordion } from "@/components/matrix/MatrixAccordion";
import { useAppPreferences } from "@/context/AppPreferencesProvider";

type MatrixShellProps = {
  params: GenerationParams;
  onParamsChange: (patch: Partial<GenerationParams>) => void;
  onApplyConfig: (params: GenerationParams) => void;
  onGenerate: (params?: GenerationParams) => void;
  onCustomGenerate?: () => void;
  onScrollToOutput?: () => void;
  onRandomizingChange?: (active: boolean) => void;
  isGenerating: boolean;
  embedded?: boolean;
  controlsOnly?: boolean;
  shufflePresetId?: string | null;
  onStopPipeline?: () => void;
  pipelineRunning?: boolean;
};

export function MatrixShell({
  params,
  onParamsChange,
  onApplyConfig,
  onGenerate,
  onCustomGenerate,
  onScrollToOutput,
  onRandomizingChange,
  isGenerating,
  embedded = false,
  controlsOnly = false,
  shufflePresetId: shufflePresetIdProp = null,
  onStopPipeline,
  pipelineRunning = false,
}: MatrixShellProps) {
  const { t } = useAppPreferences();
  const [shufflePresetIdLocal, setShufflePresetIdLocal] = useState<string | null>(null);
  const shufflePresetId = shufflePresetIdProp ?? shufflePresetIdLocal;
  const [isRandomizing, setIsRandomizing] = useState(false);
  const errors = getMatrixErrors(params);
  const canGenerate = errors.length === 0 && !isGenerating && !isRandomizing;

  const handleRandomizingChange = (active: boolean) => {
    setIsRandomizing(active);
    onRandomizingChange?.(active);
  };

  const handleModeChange = (mode: GenerationMode) => {
    onParamsChange({
      mode,
      dictionaryWeight: mode === "dictionary" ? 100 : params.dictionaryWeight,
    });
  };

  const controls = (
    <>
      <RandomizeMatrixButton
        onApplyConfig={onApplyConfig}
        onGenerate={onGenerate}
        onScrollToOutput={onScrollToOutput}
        onRandomizingChange={handleRandomizingChange}
        onShufflePresetChange={setShufflePresetIdLocal}
        onStop={onStopPipeline}
      />

      <MatrixAccordion
        title="Presets"
        subtitle={presetsMenuSummary(params)}
        defaultOpen={false}
      >
        <GeneratorPresetsPanel
          params={params}
          onChange={onParamsChange}
          shufflePresetId={shufflePresetId}
        />
      </MatrixAccordion>

      <MatrixAccordion
        title="Generation"
        subtitle={generationMenuSummary(params)}
        defaultOpen
      >
        <div className="space-y-4">
          <ModeToggleGroup value={params.mode} onChange={handleModeChange} />
          <AdvancedSliders params={params} onChange={onParamsChange} />
        </div>
      </MatrixAccordion>

      {params.mode === "phonetic" ? (
        <MatrixAccordion
          title="Phonetics & style"
          subtitle={phoneticsMenuSummary(params)}
          defaultOpen={false}
        >
          <div className="space-y-3">
            <MatrixAccordion
              title="Language fusion"
              subtitle={phoneticsMenuSummary(params).split(" · ")[0]}
              defaultOpen={false}
              nested
            >
              <LanguageFusionPanel params={params} onChange={onParamsChange} />
            </MatrixAccordion>

            <MatrixAccordion
              title="Aesthetic controls"
              subtitle={`${params.moodVector} · ${params.endingStyle} endings`}
              defaultOpen={false}
              nested
            >
              <AestheticControlsPanel params={params} onChange={onParamsChange} />
            </MatrixAccordion>
          </div>
        </MatrixAccordion>
      ) : null}

      <MatrixAccordion
        title="Character rules"
        subtitle={characterMenuSummary(params)}
        defaultOpen={false}
      >
        <CharFilterPanel params={params} onChange={onParamsChange} />
      </MatrixAccordion>

      <MatrixAccordion
        title="Platforms & seed"
        subtitle={pipelineMenuSummary(params)}
        defaultOpen={false}
      >
        <PipelineControlsPanel params={params} onChange={onParamsChange} />
      </MatrixAccordion>

      <MatrixAccordion
        title="Engine preview"
        subtitle={enginePreviewSummary(params)}
        defaultOpen={false}
      >
        <EngineSummaryPanel params={params} />
      </MatrixAccordion>

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

  const controlsScrollClass =
    isRandomizing || shufflePresetId ? "matrix-randomize-active" : "";

  if (embedded) {
    const runCustomGenerate = onCustomGenerate ?? (() => onGenerate());

    return (
      <div className="flex h-full flex-col">
        <div
          className={`matrix-menu-stack flex flex-1 flex-col gap-2 overflow-y-auto p-4 ${controlsScrollClass}`}
        >
          {controls}
        </div>
        {!controlsOnly ? (
          <footer className="gen-studio-divider shrink-0 border-t p-4">
            {pipelineRunning && onStopPipeline ? (
              <button
                type="button"
                onClick={onStopPipeline}
                className="dr-btn-stop flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                {t("stop")}
              </button>
            ) : (
              <button
                type="button"
                onClick={runCustomGenerate}
                disabled={!canGenerate}
                aria-busy={isGenerating}
                className="btn-neon-generate flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                {isGenerating ? t("generating") : t("customGenerate")}
              </button>
            )}
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
          <p className="text-xs text-zinc-500">{generationMenuSummary(params)}</p>
        </div>
      </header>

      <div
        className={`matrix-menu-stack flex flex-1 flex-col gap-2 overflow-y-auto p-5 ${controlsScrollClass}`}
      >
        {controls}
      </div>

      <footer className="border-t border-dr-border p-5">
        <button
          type="button"
          onClick={() => (onCustomGenerate ?? (() => onGenerate()))()}
          disabled={!canGenerate}
          aria-busy={isGenerating}
          className="btn-neon-generate flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {isGenerating ? t("generating") : t("customGenerate")}
        </button>
      </footer>
    </aside>
  );
}

export function useMatrixCanGenerate(params: GenerationParams, isGenerating: boolean) {
  return getMatrixErrors(params).length === 0 && !isGenerating;
}
