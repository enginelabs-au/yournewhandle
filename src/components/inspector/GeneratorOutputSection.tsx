"use client";

import type { Candidate } from "@/lib/types";
import { LazyCandidateGrid } from "@/components/inspector/LazyCandidateGrid";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { RefreshCw, Sparkles } from "lucide-react";

type GeneratorOutputSectionProps = {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: Candidate) => void;
  isGenerating: boolean;
  isRandomizing?: boolean;
  error: string | null;
  onGenerate: () => void;
  canGenerate: boolean;
  showGenerateButton?: boolean;
};

export function GeneratorOutputSection({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  isGenerating,
  isRandomizing = false,
  error,
  onGenerate,
  canGenerate,
  showGenerateButton = true,
}: GeneratorOutputSectionProps) {
  const { t } = useAppPreferences();
  const isBusy = isGenerating || isRandomizing;

  return (
    <div className="flex flex-col gap-3">
      {showGenerateButton ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          aria-busy={isBusy}
          className="gen-generate-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBusy ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          {isRandomizing
            ? "Randomizing settings…"
            : isGenerating
              ? t("generating")
              : t("generateHandles")}
        </button>
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
