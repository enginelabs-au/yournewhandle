"use client";

import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { WorkflowDirection } from "@/hooks/useWorkflowDirection";

type PipelineStep = "idle" | "generating" | "checking" | "suggesting";

type WorkflowConnectorProps = {
  direction: WorkflowDirection;
  pipelineStep: PipelineStep;
  onFlip: () => void;
  onRunPipeline: () => void;
  pipelineRunning: boolean;
  canRunPipeline: boolean;
  variant?: "vertical" | "horizontal";
};

export function WorkflowConnector({
  direction,
  pipelineStep,
  onFlip,
  onRunPipeline,
  pipelineRunning,
  canRunPipeline,
  variant = "vertical",
}: WorkflowConnectorProps) {
  const isGenerateFirst = direction === "generate-check";

  const stepLabel =
    pipelineStep === "generating"
      ? "Generating…"
      : pipelineStep === "checking"
        ? "Checking…"
        : pipelineStep === "suggesting"
          ? "Suggesting…"
          : isGenerateFirst
            ? "Generate then check"
            : "Check then generate";

  const runLabel = isGenerateFirst ? "Generate & Check" : "Check & Suggest";

  if (variant === "horizontal") {
    return (
      <div className="workflow-bridge workflow-bridge-h dr-section-card mb-5 p-4 lg:hidden">
        <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-dr-muted">
          {stepLabel}
        </p>
        <div className="flex items-center justify-center gap-4">
          <FlowArrow horizontal isGenerateFirst={isGenerateFirst} active={pipelineRunning} />
          <ConnectorControls
            direction={direction}
            stepLabel={stepLabel}
            runLabel={runLabel}
            pipelineRunning={pipelineRunning}
            canRunPipeline={canRunPipeline}
            onFlip={onFlip}
            onRunPipeline={onRunPipeline}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-bridge workflow-bridge-v hidden w-[80px] shrink-0 flex-col items-center justify-center px-1 lg:flex lg:min-h-[calc(100vh-14rem)]">
      <FlowArrow
        isGenerateFirst={isGenerateFirst}
        active={pipelineRunning}
      />
      <ConnectorControls
        direction={direction}
        stepLabel={stepLabel}
        runLabel={runLabel}
        pipelineRunning={pipelineRunning}
        canRunPipeline={canRunPipeline}
        onFlip={onFlip}
        onRunPipeline={onRunPipeline}
      />
    </div>
  );
}

function FlowArrow({
  isGenerateFirst,
  active,
  horizontal = false,
}: {
  isGenerateFirst: boolean;
  active: boolean;
  horizontal?: boolean;
}) {
  if (horizontal) {
    return (
      <div
        className={`workflow-flow-line-h ${active ? "workflow-flow-active" : ""}`}
        aria-hidden
      >
        {isGenerateFirst ? (
          <ArrowRight className="h-5 w-5 text-dr-purple-light" />
        ) : (
          <ArrowLeft className="h-5 w-5 text-dr-blue-light" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`workflow-flow-line-v mb-4 ${active ? "workflow-flow-active" : ""}`}
      aria-hidden
    >
      {isGenerateFirst ? (
        <>
          <span className="workflow-flow-dot workflow-flow-dot-gen" title="Generate" />
          <span className="workflow-flow-track workflow-flow-track-h" />
          <ArrowLeft className="h-5 w-5 shrink-0 text-dr-purple-light" />
          <span className="workflow-flow-track workflow-flow-track-h" />
          <span className="workflow-flow-dot workflow-flow-dot-check" title="Check" />
        </>
      ) : (
        <>
          <span className="workflow-flow-dot workflow-flow-dot-check" title="Check" />
          <span className="workflow-flow-track workflow-flow-track-h" />
          <ArrowRight className="h-5 w-5 shrink-0 text-dr-blue-light" />
          <span className="workflow-flow-track workflow-flow-track-h" />
          <span className="workflow-flow-dot workflow-flow-dot-gen" title="Generate" />
        </>
      )}
    </div>
  );
}

function ConnectorControls({
  direction,
  stepLabel,
  runLabel,
  pipelineRunning,
  canRunPipeline,
  onFlip,
  onRunPipeline,
  compact = false,
}: {
  direction: WorkflowDirection;
  stepLabel: string;
  runLabel: string;
  pipelineRunning: boolean;
  canRunPipeline: boolean;
  onFlip: () => void;
  onRunPipeline: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-3 ${compact ? "" : "mt-2"}`}>
      <button
        type="button"
        onClick={onFlip}
        className="workflow-flip-btn group"
        aria-label={`Flip workflow. ${stepLabel}`}
        title="Flip workflow order"
      >
        <RefreshCw
          className={`h-4 w-4 transition-transform duration-500 group-hover:rotate-180 ${
            direction === "check-generate" ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      <button
        type="button"
        onClick={onRunPipeline}
        disabled={pipelineRunning || !canRunPipeline}
        className={`btn-pipeline flex flex-col items-center justify-center gap-1 rounded-xl font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
          compact ? "px-4 py-2.5 text-xs" : "px-3 py-3 text-[10px]"
        }`}
      >
        {pipelineRunning ? (
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        <span className="max-w-[4.5rem] text-center leading-tight">{runLabel}</span>
      </button>

      {!compact ? (
        <p className="max-w-[4.5rem] text-center text-[9px] leading-snug text-dr-muted">
          {stepLabel}
        </p>
      ) : null}
    </div>
  );
}
