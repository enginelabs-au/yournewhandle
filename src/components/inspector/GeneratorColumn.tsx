"use client";

import { useCallback, useRef } from "react";
import type { Candidate, GenerationParams } from "@/lib/types";
import { MatrixShell } from "@/components/matrix/MatrixShell";
import { GeneratorOutputSection } from "@/components/inspector/GeneratorOutputSection";
import { AiGeneratePanel } from "@/components/inspector/AiGeneratePanel";

type GeneratorColumnProps = {
  params: GenerationParams;
  onParamsChange: (patch: Partial<GenerationParams>) => void;
  onApplyConfig: (params: GenerationParams) => void;
  onGenerate: (overrideParams?: GenerationParams) => void;
  onRandomizingChange?: (active: boolean) => void;
  canGenerate: boolean;
  isGenerating: boolean;
  isRandomizing?: boolean;
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onPolishApply: (handle: string) => void;
  onAiResults: (handles: string[]) => void;
  error: string | null;
};

export function GeneratorColumn({
  params,
  onParamsChange,
  onApplyConfig,
  onGenerate,
  onRandomizingChange,
  canGenerate,
  isGenerating,
  isRandomizing = false,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onPolishApply,
  onAiResults,
  error,
}: GeneratorColumnProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  const scrollToOutput = useCallback(() => {
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ??
    null;

  const outputProps = {
    candidates,
    selectedCandidateId,
    onSelectCandidate,
    isGenerating,
    isRandomizing,
    error,
    onGenerate: () => onGenerate(),
    canGenerate,
  };

  return (
    <div
      id="generator"
      className="gen-studio-panel flex min-h-[720px] flex-col overflow-hidden lg:min-h-[calc(100vh-14rem)]"
    >
      <div className="gen-studio-mesh" aria-hidden />
      <div className="gen-studio-accent" aria-hidden />

      <div
        ref={outputRef}
        id="generator-output"
        className="gen-studio-divider relative shrink-0 border-b p-4 sm:p-5"
      >
        <GeneratorOutputSection {...outputProps} />
        <div className="mt-4">
          <AiGeneratePanel
            params={params}
            selectedCandidate={selectedCandidate}
            onApplySuggestion={onPolishApply}
            onAiResults={onAiResults}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <MatrixShell
          params={params}
          onParamsChange={onParamsChange}
          onApplyConfig={onApplyConfig}
          onGenerate={onGenerate}
          onScrollToOutput={scrollToOutput}
          onRandomizingChange={onRandomizingChange}
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
