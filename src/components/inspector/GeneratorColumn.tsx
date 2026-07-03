"use client";

import type { Candidate, GenerationParams } from "@/lib/types";
import { MatrixShell } from "@/components/matrix/MatrixShell";
import { GeneratorOutputSection } from "@/components/inspector/GeneratorOutputSection";

type GeneratorColumnProps = {
  params: GenerationParams;
  onParamsChange: (patch: Partial<GenerationParams>) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: Candidate) => void;
  error: string | null;
};

export function GeneratorColumn({
  params,
  onParamsChange,
  onGenerate,
  canGenerate,
  isGenerating,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  error,
}: GeneratorColumnProps) {
  const outputProps = {
    candidates,
    selectedCandidateId,
    onSelectCandidate,
    isGenerating,
    error,
    onGenerate,
    canGenerate,
  };

  return (
    <div
      id="generator"
      className="gen-studio-panel flex min-h-[720px] flex-col overflow-hidden lg:min-h-[calc(100vh-14rem)]"
    >
      <div className="gen-studio-mesh" aria-hidden />
      <div className="gen-studio-accent" aria-hidden />

      <div className="gen-studio-divider relative shrink-0 border-b p-4 sm:p-5">
        <GeneratorOutputSection {...outputProps} />
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <MatrixShell
          params={params}
          onParamsChange={onParamsChange}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          embedded
          controlsOnly
        />
      </div>

      <div className="gen-studio-divider relative shrink-0 border-t p-4 sm:p-5">
        <GeneratorOutputSection {...outputProps} />
      </div>
    </div>
  );
}
