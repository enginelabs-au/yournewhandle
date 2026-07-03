"use client";

import dynamic from "next/dynamic";
import type { Candidate } from "@/lib/types";

const CandidateGridInner = dynamic(
  () =>
    import("@/components/inspector/CandidateGrid").then((mod) => mod.CandidateGrid),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-md border border-border-subtle/60 bg-base/60"
            aria-hidden
          />
        ))}
      </div>
    ),
  },
);

type LazyCandidateGridProps = {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelect: (candidate: Candidate) => void;
  isGenerating: boolean;
};

export function LazyCandidateGrid(props: LazyCandidateGridProps) {
  return <CandidateGridInner {...props} />;
}
