"use client";

import { SliderField } from "@/components/ui/matrix-controls";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import {
  WORKFLOW_LENGTH_MAX,
  WORKFLOW_LENGTH_MIN,
  clampLengthForWorkflow,
} from "@/lib/length-bounds";

type HandleLengthSliderProps = {
  maxLen: number;
  hardLock: boolean;
  onHardLockChange: (locked: boolean) => void;
  onChange: (length: number) => void;
  disabled?: boolean;
};

export function HandleLengthSlider({
  maxLen,
  hardLock,
  onHardLockChange,
  onChange,
  disabled = false,
}: HandleLengthSliderProps) {
  const { t } = useAppPreferences();
  const sliderValue = clampLengthForWorkflow(maxLen);

  return (
    <div className="workflow-length-slider w-full max-w-sm space-y-2 px-2">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={hardLock}
          disabled={disabled}
          onClick={() => onHardLockChange(!hardLock)}
          className={`check-filter-chip shrink-0 text-[10px] disabled:cursor-not-allowed disabled:opacity-50 ${
            hardLock ? "check-filter-chip-active" : ""
          }`}
        >
          {t("handleLengthExact")}
        </button>
        <span className="text-[10px] text-dr-muted">
          {hardLock ? t("handleLengthExactHint") : t("handleLengthRangeHint")}
        </span>
      </div>
      <SliderField
        id="workflow-handle-length"
        label={hardLock ? t("handleLength") : t("handleLengthMax")}
        min={WORKFLOW_LENGTH_MIN}
        max={WORKFLOW_LENGTH_MAX}
        value={sliderValue}
        disabled={disabled}
        onChange={(next) => onChange(clampLengthForWorkflow(next))}
      />
    </div>
  );
}
