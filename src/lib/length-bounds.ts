/** Matrix advanced sliders; workflow control uses WORKFLOW_LENGTH_* below. */
export const LENGTH_SLIDER_MIN = 1;
export const LENGTH_SLIDER_MAX = 30;
export const LENGTH_INPUT_MIN = 1;
export const LENGTH_INPUT_MAX = 999;

/** Generate & Check workflow length control. */
export const WORKFLOW_LENGTH_MIN = 4;
export const WORKFLOW_LENGTH_MAX = 30;

export function clampLengthInput(value: number): number {
  if (!Number.isFinite(value)) return LENGTH_INPUT_MIN;
  return Math.min(LENGTH_INPUT_MAX, Math.max(LENGTH_INPUT_MIN, Math.round(value)));
}

export function clampLengthForSlider(value: number): number {
  return Math.min(LENGTH_SLIDER_MAX, Math.max(LENGTH_SLIDER_MIN, value));
}

export function clampLengthForWorkflow(value: number): number {
  if (!Number.isFinite(value)) return WORKFLOW_LENGTH_MIN;
  return Math.min(
    WORKFLOW_LENGTH_MAX,
    Math.max(WORKFLOW_LENGTH_MIN, Math.round(value)),
  );
}

export function clampWorkflowLengthBounds(
  minLen: number,
  maxLen: number,
): { minLen: number; maxLen: number } {
  const min = clampLengthForWorkflow(minLen);
  const max = clampLengthForWorkflow(maxLen);
  return { minLen: Math.min(min, max), maxLen: Math.max(min, max) };
}
