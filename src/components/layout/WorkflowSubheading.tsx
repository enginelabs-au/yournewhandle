"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import type { WorkflowDirection } from "@/hooks/useWorkflowPipeline";

type WorkflowSubheadingProps = {
  direction: WorkflowDirection;
  onFlip: () => void;
  onRunPipeline: () => void;
  pipelineRunning: boolean;
  canRunPipeline: boolean;
};

export function WorkflowSubheading({
  direction,
  onFlip,
  onRunPipeline,
  pipelineRunning,
  canRunPipeline,
}: WorkflowSubheadingProps) {
  const { t } = useAppPreferences();
  const isGenerateFirst = direction === "generate-check";

  const runLabel = pipelineRunning
    ? t("running")
    : isGenerateFirst
      ? t("generateCheck")
      : t("checkSuggest");

  const leftLabel = isGenerateFirst ? t("generate") : t("check");
  const rightLabel = isGenerateFirst ? t("check") : t("generate");
  const leftClass = isGenerateFirst ? "workflow-sub-gen" : "workflow-sub-check";
  const rightClass = isGenerateFirst ? "workflow-sub-check" : "workflow-sub-gen";

  return (
    <div className="workflow-subheading-wrap mb-6 flex flex-col items-center gap-3">
      <div className="workflow-subheading">
        <span className={`workflow-sub-slot workflow-sub-slot-left ${leftClass}`}>
          {leftLabel}
        </span>
        <button
          type="button"
          onClick={onFlip}
          className="workflow-flip-btn group"
          aria-label={t("flipWorkflow")}
          title={t("flipWorkflow")}
        >
          <RefreshCw
            className={`h-4 w-4 transition-transform duration-500 group-hover:rotate-180 ${
              direction === "check-generate" ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
        <span className={`workflow-sub-slot workflow-sub-slot-right ${rightClass}`}>
          {rightLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={onRunPipeline}
        disabled={pipelineRunning || !canRunPipeline}
        className="btn-pipeline inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pipelineRunning ? (
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        {runLabel}
      </button>
    </div>
  );
}
