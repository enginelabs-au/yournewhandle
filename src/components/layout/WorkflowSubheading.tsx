"use client";

import { RefreshCw, Sparkles, Square } from "lucide-react";
import { HandleLengthSlider } from "@/components/layout/HandleLengthSlider";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import type {
  StudioZone,
  WorkflowDirection,
} from "@/hooks/useWorkflowDirection";

type WorkflowSubheadingProps = {
  direction: WorkflowDirection;
  activeZone: StudioZone;
  onSelectZone: (zone: StudioZone) => void;
  onFlip: () => void;
  onGenerateAndCheck: () => void;
  onStop: () => void;
  isRunning: boolean;
  canRun: boolean;
  handleLength: number;
  lengthHardLock: boolean;
  onLengthHardLockChange: (locked: boolean) => void;
  onLengthChange: (length: number) => void;
};

export function WorkflowSubheading({
  direction,
  activeZone,
  onSelectZone,
  onFlip,
  onGenerateAndCheck,
  onStop,
  isRunning,
  canRun,
  handleLength,
  lengthHardLock,
  onLengthHardLockChange,
  onLengthChange,
}: WorkflowSubheadingProps) {
  const { t } = useAppPreferences();
  const isGenerateFirst = direction === "generate-check";

  const leftZone: StudioZone = isGenerateFirst ? "generate" : "check";
  const rightZone: StudioZone = isGenerateFirst ? "check" : "generate";
  const leftLabel = isGenerateFirst ? t("generate") : t("check");
  const rightLabel = isGenerateFirst ? t("check") : t("generate");
  const leftClass = isGenerateFirst ? "workflow-sub-gen" : "workflow-sub-check";
  const rightClass = isGenerateFirst ? "workflow-sub-check" : "workflow-sub-gen";

  return (
    <div className="workflow-subheading-wrap mb-6 flex flex-col items-center gap-3">
      <div className="workflow-subheading">
        <button
          type="button"
          onClick={() => onSelectZone(leftZone)}
          className={`workflow-sub-slot workflow-sub-slot-btn workflow-sub-slot-left ${leftClass} ${
            activeZone === leftZone ? "workflow-sub-slot-active" : ""
          }`}
          aria-pressed={activeZone === leftZone}
        >
          {leftLabel}
        </button>
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
        <button
          type="button"
          onClick={() => onSelectZone(rightZone)}
          className={`workflow-sub-slot workflow-sub-slot-btn workflow-sub-slot-right ${rightClass} ${
            activeZone === rightZone ? "workflow-sub-slot-active" : ""
          }`}
          aria-pressed={activeZone === rightZone}
        >
          {rightLabel}
        </button>
      </div>

      {isRunning ? (
        <button
          type="button"
          onClick={onStop}
          className="dr-btn-stop inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold"
        >
          <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
          {t("stop")}
        </button>
      ) : (
        <button
          type="button"
          onClick={onGenerateAndCheck}
          disabled={!canRun}
          className="btn-pipeline inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {t("generateCheck")}
        </button>
      )}

      <HandleLengthSlider
        maxLen={handleLength}
        hardLock={lengthHardLock}
        onHardLockChange={onLengthHardLockChange}
        onChange={onLengthChange}
        disabled={isRunning}
      />
    </div>
  );
}
