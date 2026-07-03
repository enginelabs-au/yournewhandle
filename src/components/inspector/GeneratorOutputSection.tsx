"use client";

import type { Candidate } from "@/lib/types";
import { LazyCandidateGrid } from "@/components/inspector/LazyCandidateGrid";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { RefreshCw, Shuffle, Square } from "lucide-react";

type GeneratorOutputSectionProps = {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: Candidate) => void;
  isGenerating: boolean;
  isRandomizing?: boolean;
  isBatchChecking?: boolean;
  pipelineRunning?: boolean;
  error: string | null;
  onGenerateRandomlyAndCheck: () => void;
  onStopPipeline?: () => void;
  canGenerate: boolean;
  showGenerateButtons?: boolean;
};

export function GeneratorOutputSection({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  isGenerating,
  isRandomizing = false,
  isBatchChecking = false,
  pipelineRunning = false,
  error,
  onGenerateRandomlyAndCheck,
  onStopPipeline,
  canGenerate,
  showGenerateButtons = true,
}: GeneratorOutputSectionProps) {
  const { t } = useAppPreferences();
  const isBusy = pipelineRunning || isGenerating || isRandomizing || isBatchChecking;

  return (
    <div className="flex flex-col gap-3">
      {showGenerateButtons ? (
        isBusy && onStopPipeline ? (
          <button
            type="button"
            onClick={onStopPipeline}
            className="dr-btn-stop flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold"
          >
            <Square className="h-4 w-4 fill-current" aria-hidden />
            {t("stop")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerateRandomlyAndCheck}
            disabled={!canGenerate}
            className="gen-generate-random-check-btn flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dr-purple-light/45 bg-gradient-to-r from-dr-purple/20 to-cyan-950/35 px-4 py-3.5 text-sm font-bold text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Shuffle className="h-4 w-4 text-dr-purple-light" aria-hidden />
            {t("generateRandomlyAndCheck")}
          </button>
        )
      ) : null}

      {isBusy && !onStopPipeline ? (
        <p className="flex items-center justify-center gap-2 text-center text-[11px] text-dr-muted">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden />
          {isRandomizing
            ? t("randomizing")
            : isGenerating
              ? t("generating")
              : isBatchChecking
                ? t("checkingBatch")
                : t("running")}
        </p>
      ) : null}

      <div
        className={`gen-results-zone rounded-xl p-3 transition ${
          isBusy ? "gen-results-zone-active" : ""
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="gen-output-label text-[11px] font-bold uppercase tracking-widest">
            {t("output")}
          </h3>
          <span className="gen-output-count rounded-full px-2 py-0.5 text-[10px] tabular-nums">
            {candidates.length}
          </span>
        </div>

        {error ? (
          <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
            {error}
          </p>
        ) : null}

        <LazyCandidateGrid
          candidates={candidates}
          selectedCandidateId={selectedCandidateId}
          onSelect={onSelectCandidate}
          isGenerating={isGenerating}
          isRandomizing={isRandomizing}
        />
      </div>
    </div>
  );
}
