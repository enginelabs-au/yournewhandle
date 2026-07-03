/** Slider caps at 30; number inputs allow custom lengths up to 999. */
export const LENGTH_SLIDER_MIN = 1;
export const LENGTH_SLIDER_MAX = 30;
export const LENGTH_INPUT_MIN = 1;
export const LENGTH_INPUT_MAX = 999;

export function clampLengthInput(value: number): number {
  if (!Number.isFinite(value)) return LENGTH_INPUT_MIN;
  return Math.min(LENGTH_INPUT_MAX, Math.max(LENGTH_INPUT_MIN, Math.round(value)));
}

export function clampLengthForSlider(value: number): number {
  return Math.min(LENGTH_SLIDER_MAX, Math.max(LENGTH_SLIDER_MIN, value));
}
