"use client";

import type { Candidate } from "@/lib/types";
import type { CheckReport } from "@/lib/checker/orchestrator";
import { LazyCandidateGrid } from "@/components/inspector/LazyCandidateGrid";
import { CheckerPanel } from "@/components/inspector/CheckerPanel";
import { Sparkles } from "lucide-react";

type InspectorShellProps = {
  candidates: Candidate[];
  isGenerating: boolean;
  error: string | null;
  selectedCandidateId: string | null;
  selectedHandle: string | null;
  report: CheckReport | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onRetryChecks: () => void;
};

export function InspectorShell({
  candidates,
  isGenerating,
  error,
  selectedCandidateId,
  selectedHandle,
  report,
  onSelectCandidate,
}: InspectorShellProps) {
  return (
    <section className="flex flex-col gap-6" aria-label="Results and generator">
      {error ? (
        <p className="rounded-xl border border-dr-amber/30 bg-dr-amber/10 px-4 py-3 text-sm text-dr-amber">
          {error}
        </p>
      ) : null}

      <div className="dr-section-card p-5 sm:p-6">
        <CheckerPanel report={report} selectedHandle={selectedHandle} />
      </div>

      <div id="generator" className="dr-section-card overflow-hidden">
        <header className="flex items-center gap-3 border-b border-dr-border px-5 py-4">
          <Sparkles className="h-4 w-4 text-dr-purple-light" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Handle Generator
            </h2>
            <p className="text-xs text-dr-muted">
              Phonetic &amp; dictionary engine — generate pronounceable usernames,
              then click any result to check availability.
            </p>
          </div>
        </header>
        <div className="p-5">
          <LazyCandidateGrid
            candidates={candidates}
            selectedCandidateId={selectedCandidateId}
            onSelect={onSelectCandidate}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </section>
  );
}
