"use client";

import { DnsRobotHeader } from "@/components/layout/DnsRobotHeader";
import { DnsRobotFooter } from "@/components/layout/DnsRobotFooter";
import { RotatingPlatformHero } from "@/components/layout/RotatingPlatformHero";
import { WorkflowSubheading } from "@/components/layout/WorkflowSubheading";
import { StudioZoneLabel } from "@/components/layout/StudioZoneLabel";
import { CheckerColumn } from "@/components/inspector/CheckerColumn";
import { GeneratorColumn } from "@/components/inspector/GeneratorColumn";
import { InspectorErrorBoundary } from "@/components/inspector/InspectorErrorBoundary";
import { useGenerateCandidates } from "@/hooks/useGenerateCandidates";
import { useGenerationParams } from "@/hooks/useGenerationParams";
import { useChecker } from "@/hooks/useChecker";
import { useWorkflowPipeline } from "@/hooks/useWorkflowPipeline";
import { getMatrixErrors } from "@/lib/matrix-validation";
import { normalizeHandleForCheck } from "@/lib/checker/constants";
import type { Candidate } from "@/lib/types";
import { useState } from "react";

export function Dashboard() {
  const { candidates, isGenerating, error, generate } = useGenerateCandidates();
  const { params, updateParams, hydrated } = useGenerationParams();
  const {
    selectedHandle,
    selectedCandidateId,
    report,
    selectHandle,
    stopChecks,
    rerunChecks,
  } = useChecker();

  const [checkDraft, setCheckDraft] = useState("");

  const {
    direction,
    flipDirection,
    focusCheck,
    runPipeline,
    pipelineStep,
    pipelineRunning,
  } = useWorkflowPipeline({
    checkDraft,
    candidates,
    isGenerating,
    report,
    params,
    generate,
    selectHandle,
  });

  const canGenerate =
    getMatrixErrors(params).length === 0 && !isGenerating && !pipelineRunning;

  const isGenerateFirst = direction === "generate-check";
  const canRunPipeline =
    !pipelineRunning &&
    (isGenerateFirst
      ? canGenerate
      : Boolean(normalizeHandleForCheck(checkDraft.trim())));

  const handleGenerate = () => generate(params);

  const handleSelectCandidate = (candidate: Candidate) => {
    selectHandle(candidate.normalized, candidate.id);
    setCheckDraft(candidate.normalized);
  };

  const handleManualCheck = (handle: string) => {
    setCheckDraft(handle);
    selectHandle(handle, null);
  };

  if (!hydrated) {
    return (
      <div className="dr-page flex min-h-screen flex-col">
        <div className="h-14 animate-pulse border-b border-dr-border bg-dr-panel" />
        <div className="mx-auto mt-8 h-96 w-full max-w-[1400px] animate-pulse rounded-xl bg-dr-panel px-4" />
      </div>
    );
  }

  return (
    <div className="dr-page flex min-h-screen flex-col">
      <DnsRobotHeader />

      <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-6 lg:px-6 lg:py-8">
        <RotatingPlatformHero />

        <InspectorErrorBoundary>
          <WorkflowSubheading
            direction={direction}
            onFlip={flipDirection}
            onRunPipeline={runPipeline}
            pipelineRunning={pipelineRunning}
            canRunPipeline={canRunPipeline}
          />

          <div className="studio-grid grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-5 lg:gap-6">
            <div
              className={`studio-column panel-enter-left min-w-0 ${
                !isGenerateFirst ? "studio-column-active" : "studio-column-idle"
              }`}
            >
              <StudioZoneLabel zone="check" direction={direction} />
              <CheckerColumn
                selectedHandle={selectedHandle}
                report={report}
                checkDraft={checkDraft}
                onCheckDraftChange={setCheckDraft}
                onSubmit={handleManualCheck}
                onStop={stopChecks}
                onRetry={rerunChecks}
                onInputFocus={focusCheck}
                disabled={isGenerating || pipelineRunning}
                pipelineActive={pipelineStep === "checking"}
              />
            </div>

            <div
              className={`studio-column panel-enter-right min-w-0 ${
                isGenerateFirst ? "studio-column-active" : "studio-column-idle"
              }`}
            >
              <StudioZoneLabel zone="generate" direction={direction} />
              <GeneratorColumn
                params={params}
                onParamsChange={updateParams}
                onGenerate={handleGenerate}
                canGenerate={canGenerate}
                isGenerating={isGenerating}
                candidates={candidates}
                selectedCandidateId={selectedCandidateId}
                onSelectCandidate={handleSelectCandidate}
                error={error}
              />
            </div>
          </div>
        </InspectorErrorBoundary>
      </main>

      <DnsRobotFooter />
    </div>
  );
}
