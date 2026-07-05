"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RotatingPlatformHero } from "@/components/layout/RotatingPlatformHero";
import { WorkflowSubheading } from "@/components/layout/WorkflowSubheading";
import { StudioZoneLabel } from "@/components/layout/StudioZoneLabel";
import { CheckerColumn } from "@/components/inspector/CheckerColumn";
import { GeneratorColumn } from "@/components/inspector/GeneratorColumn";
import { InspectorErrorBoundary } from "@/components/inspector/InspectorErrorBoundary";
import { useBatchAvailability } from "@/hooks/useBatchAvailability";
import { useGenerateCandidates } from "@/hooks/useGenerateCandidates";
import { useGenerationParams } from "@/hooks/useGenerationParams";
import { useChecker } from "@/hooks/useChecker";
import { useRandomizeGenerate } from "@/hooks/useRandomizeGenerate";
import { useWorkflowDirection } from "@/hooks/useWorkflowDirection";
import {
  WORKFLOW_LENGTH_MIN,
  clampLengthForWorkflow,
} from "@/lib/length-bounds";
import { getMatrixErrors } from "@/lib/matrix-validation";
import type { CheckMode } from "@/lib/platforms-registry";
import type { Candidate, GenerationParams } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function Dashboard() {
  const {
    candidates,
    isGenerating,
    error,
    generate,
    cancelGenerate,
    setAiCandidates,
  } = useGenerateCandidates();
  const { params, updateParams, setParams, hydrated } = useGenerationParams();
  const {
    selectedHandle,
    selectedCandidateId,
    report,
    selectHandle,
    stopChecks,
    rerunChecks,
  } = useChecker();

  const [checkDraft, setCheckDraft] = useState("");
  const [generateSelectedId, setGenerateSelectedId] = useState<string | null>(
    null,
  );
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [shufflePresetId, setShufflePresetId] = useState<string | null>(null);
  const pendingBatchCheck = useRef(false);
  const [lengthHardLock, setLengthHardLock] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    try {
      const stored = localStorage.getItem("ynh:length-hard-lock");
      const locked = stored === "1";
      setLengthHardLock(locked);
      const len = clampLengthForWorkflow(params.maxLen);
      if (locked) {
        if (params.minLen !== len || params.maxLen !== len) {
          updateParams({ minLen: len, maxLen: len });
        }
      } else if (params.minLen === params.maxLen) {
        updateParams({ minLen: WORKFLOW_LENGTH_MIN, maxLen: len });
      }
    } catch {
      // ignore storage errors
    }
  }, [hydrated, params.maxLen, params.minLen, updateParams]);

  const {
    direction,
    activeZone,
    flipDirection,
    selectCheckZone,
    selectGenerateZone,
    focusCheck,
  } = useWorkflowDirection();

  const {
    isBatchChecking,
    batchCandidates,
    batchProgress,
    batchPlatformResults,
    checkCandidatesBatch,
    cancelBatchCheck,
    clearAvailability,
  } = useBatchAvailability({ onFocusCheck: focusCheck });

  const handleGenerate = useCallback(
    (overrideParams?: GenerationParams) => {
      clearAvailability();
      generate(overrideParams ?? params);
    },
    [clearAvailability, generate, params],
  );

  const {
    runRandomizeAndGenerate,
    cancelRandomize,
    isRandomizing: randomizingActive,
  } = useRandomizeGenerate({
    onApplyConfig: setParams,
    onGenerate: handleGenerate,
    onRandomizingChange: setIsRandomizing,
    onShufflePresetChange: setShufflePresetId,
    getLengthConstraint: () =>
      lengthHardLock
        ? { minLen: params.minLen, maxLen: params.maxLen }
        : undefined,
  });

  const isRandomizingAny = isRandomizing || randomizingActive;

  const handleGenerateAndCheck = useCallback(async () => {
    clearAvailability();
    pendingBatchCheck.current = true;
    await runRandomizeAndGenerate();
  }, [clearAvailability, runRandomizeAndGenerate]);

  useEffect(() => {
    if (!pendingBatchCheck.current || isGenerating || isRandomizingAny) {
      return;
    }
    if (candidates.length === 0) {
      pendingBatchCheck.current = false;
      return;
    }
    pendingBatchCheck.current = false;
    setGenerateSelectedId(null);
    void checkCandidatesBatch(candidates);
  }, [candidates, checkCandidatesBatch, isGenerating, isRandomizingAny]);

  const pipelineRunning =
    isGenerating || isRandomizingAny || isBatchChecking;

  const handleStopPipeline = useCallback(() => {
    pendingBatchCheck.current = false;
    cancelRandomize();
    cancelGenerate();
    cancelBatchCheck();
    stopChecks();
  }, [cancelBatchCheck, cancelGenerate, cancelRandomize, stopChecks]);

  const handleLengthHardLockChange = useCallback(
    (locked: boolean) => {
      setLengthHardLock(locked);
      try {
        localStorage.setItem("ynh:length-hard-lock", locked ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      const len = clampLengthForWorkflow(params.maxLen);
      if (locked) {
        updateParams({ minLen: len, maxLen: len });
      } else {
        updateParams({ minLen: WORKFLOW_LENGTH_MIN, maxLen: len });
      }
    },
    [params.maxLen, updateParams],
  );

  const handleLengthChange = useCallback(
    (length: number) => {
      const len = clampLengthForWorkflow(length);
      if (lengthHardLock) {
        updateParams({ minLen: len, maxLen: len });
      } else {
        updateParams({ minLen: WORKFLOW_LENGTH_MIN, maxLen: len });
      }
    },
    [lengthHardLock, updateParams],
  );

  const canGenerate =
    getMatrixErrors(params).length === 0 && !pipelineRunning;

  const isCheckActive = activeZone === "check";
  const showBatchCheckUi = batchCandidates.length > 0;

  const handleSelectCandidate = (candidate: Candidate) => {
    setGenerateSelectedId(candidate.id);

    if (showBatchCheckUi && !isBatchChecking) {
      clearAvailability();
      selectHandle(candidate.normalized, candidate.id, "light");
      setCheckDraft(candidate.normalized);
      return;
    }

    if (!showBatchCheckUi) {
      selectHandle(candidate.normalized, candidate.id, "light");
      setCheckDraft(candidate.normalized);
    }
  };

  const handleManualCheck = (handle: string, mode: CheckMode = "light") => {
    clearAvailability();
    setCheckDraft(handle);
    selectHandle(handle, null, mode);
  };

  const handlePolishApply = (handle: string) => {
    setCheckDraft(handle);
    selectHandle(handle, null, "light");
  };

  const handleAiResults = (handles: string[]) => {
    setAiCandidates(handles, params.mode);
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
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-6 lg:px-6 lg:py-8">
        <RotatingPlatformHero params={params} />

        <InspectorErrorBoundary>
          <WorkflowSubheading
            direction={direction}
            activeZone={activeZone}
            onSelectZone={(zone) =>
              zone === "check" ? selectCheckZone() : selectGenerateZone()
            }
            onFlip={flipDirection}
            onGenerateAndCheck={() => void handleGenerateAndCheck()}
            onStop={handleStopPipeline}
            isRunning={pipelineRunning}
            canRun={canGenerate}
            handleLength={params.maxLen}
            lengthHardLock={lengthHardLock}
            onLengthHardLockChange={handleLengthHardLockChange}
            onLengthChange={handleLengthChange}
          />

          <div className="studio-grid grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-5 lg:gap-6">
            <div
              className={`studio-column panel-enter-left min-w-0 ${
                isCheckActive ? "studio-column-active" : "studio-column-idle"
              }`}
              onPointerDown={selectCheckZone}
            >
              <StudioZoneLabel zone="check" />
              <CheckerColumn
                selectedHandle={selectedHandle}
                report={report}
                checkDraft={checkDraft}
                onCheckDraftChange={setCheckDraft}
                onSubmit={handleManualCheck}
                onStop={
                  showBatchCheckUi && isBatchChecking
                    ? handleStopPipeline
                    : stopChecks
                }
                onRetry={rerunChecks}
                onInputFocus={focusCheck}
                disabled={isGenerating || isRandomizingAny}
                pipelineActive={isBatchChecking}
                batchCandidates={batchCandidates}
                batchPlatformResults={batchPlatformResults}
                batchProgress={batchProgress}
                isBatchChecking={isBatchChecking}
              />
            </div>

            <div
              className={`studio-column panel-enter-right min-w-0 ${
                !isCheckActive ? "studio-column-active" : "studio-column-idle"
              }`}
              onPointerDown={selectGenerateZone}
            >
              <StudioZoneLabel zone="generate" />
              <GeneratorColumn
                params={params}
                onParamsChange={updateParams}
                onApplyConfig={setParams}
                onGenerate={handleGenerate}
                onGenerateAndCheck={() => void handleGenerateAndCheck()}
                onStopPipeline={handleStopPipeline}
                onRandomizingChange={setIsRandomizing}
                shufflePresetId={shufflePresetId}
                canGenerate={canGenerate}
                isGenerating={isGenerating}
                isRandomizing={isRandomizingAny}
                isBatchChecking={isBatchChecking}
                pipelineRunning={pipelineRunning}
                candidates={candidates}
                selectedCandidateId={
                  generateSelectedId ?? selectedCandidateId
                }
                onSelectCandidate={handleSelectCandidate}
                onPolishApply={handlePolishApply}
                onAiResults={handleAiResults}
                error={error}
              />
            </div>
          </div>
        </InspectorErrorBoundary>
      </main>

      <SiteFooter />
    </div>
  );
}
