"use client";

import type { Candidate } from "@/lib/types";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { CandidateCard } from "./CandidateCard";

type CandidateGridProps = {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelect: (candidate: Candidate) => void;
  isGenerating: boolean;
  isRandomizing?: boolean;
};

export function CandidateGrid({
  candidates,
  selectedCandidateId,
  onSelect,
  isGenerating,
  isRandomizing = false,
}: CandidateGridProps) {
  const { t } = useAppPreferences();
  const showLoading = isGenerating || isRandomizing;

  if (showLoading && candidates.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-center text-[11px] text-dr-muted">
          {isRandomizing
            ? "Shuffling matrix settings…"
            : t("generating")}
        </p>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="candidate-shimmer h-11 rounded-lg border border-dr-border/40"
            aria-hidden
          />
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-dr-border/60 bg-dr-panel/30 px-4 py-6 text-center">
        <p className="text-xs text-dr-muted">{t("emptyGenerateHint")}</p>
      </div>
    );
  }

  return (
    <div className="candidate-grid-scroll max-h-[29rem] min-h-[29rem] space-y-2 overflow-y-auto pr-1">
      {candidates.map((candidate, index) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          selected={selectedCandidateId === candidate.id}
          onSelect={onSelect}
          index={index}
        />
      ))}
    </div>
  );
}
