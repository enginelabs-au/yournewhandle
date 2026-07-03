"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeHandleForCheck } from "@/lib/checker/constants";
import type { CheckReport } from "@/lib/checker/orchestrator";
import type { Candidate, GenerationParams } from "@/lib/types";

export type WorkflowDirection = "generate-check" | "check-generate";

export type PipelineStep = "idle" | "generating" | "checking" | "suggesting";

type UseWorkflowPipelineArgs = {
  checkDraft: string;
  candidates: Candidate[];
  isGenerating: boolean;
  report: CheckReport | null;
  params: GenerationParams;
  generate: (params: GenerationParams) => void;
  selectHandle: (handle: string, candidateId: string | null) => void;
};

export function useWorkflowPipeline({
  checkDraft,
  candidates,
  isGenerating,
  report,
  params,
  generate,
  selectHandle,
}: UseWorkflowPipelineArgs) {
  const [direction, setDirection] = useState<WorkflowDirection>("check-generate");
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const pipelineActive = useRef(false);

  const flipDirection = useCallback(() => {
    setDirection((current) =>
      current === "generate-check" ? "check-generate" : "generate-check",
    );
  }, []);

  const focusCheck = useCallback(() => {
    setDirection("check-generate");
  }, []);

  const focusGenerate = useCallback(() => {
    setDirection("generate-check");
  }, []);

  const runPipeline = useCallback(() => {
    if (pipelineStep !== "idle" || isGenerating || report?.isRunning) {
      return;
    }

    if (direction === "generate-check") {
      pipelineActive.current = true;
      setPipelineStep("generating");
      generate(params);
      return;
    }

    const handle = normalizeHandleForCheck(checkDraft.trim());
    if (!handle) {
      return;
    }

    pipelineActive.current = true;
    setPipelineStep("checking");
    selectHandle(handle, null);
  }, [
    checkDraft,
    direction,
    generate,
    isGenerating,
    params,
    pipelineStep,
    report?.isRunning,
    selectHandle,
  ]);

  useEffect(() => {
    if (!pipelineActive.current || direction !== "generate-check") {
      return;
    }

    if (pipelineStep === "generating" && !isGenerating) {
      if (candidates.length > 0) {
        const first = candidates[0]!;
        setPipelineStep("checking");
        selectHandle(first.normalized, first.id);
      } else {
        pipelineActive.current = false;
        setPipelineStep("idle");
      }
    }
  }, [candidates, direction, isGenerating, pipelineStep, selectHandle]);

  useEffect(() => {
    if (!pipelineActive.current || direction !== "generate-check") {
      return;
    }

    if (pipelineStep === "checking" && report && !report.isRunning) {
      pipelineActive.current = false;
      setPipelineStep("idle");
    }
  }, [direction, pipelineStep, report]);

  useEffect(() => {
    if (!pipelineActive.current || direction !== "check-generate") {
      return;
    }

    if (pipelineStep === "checking" && report && !report.isRunning) {
      setPipelineStep("suggesting");
      generate(params);
    }
  }, [direction, generate, params, pipelineStep, report]);

  useEffect(() => {
    if (!pipelineActive.current || direction !== "check-generate") {
      return;
    }

    if (pipelineStep === "suggesting" && !isGenerating) {
      pipelineActive.current = false;
      setPipelineStep("idle");
    }
  }, [direction, isGenerating, pipelineStep]);

  const pipelineRunning =
    pipelineStep !== "idle" || isGenerating || Boolean(report?.isRunning);

  return {
    direction,
    flipDirection,
    focusCheck,
    focusGenerate,
    runPipeline,
    pipelineStep,
    pipelineRunning,
  };
}
