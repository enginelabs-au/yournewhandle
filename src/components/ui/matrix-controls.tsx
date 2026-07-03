import type { ReactNode } from "react";
import {
  LENGTH_INPUT_MAX,
  LENGTH_INPUT_MIN,
  LENGTH_SLIDER_MAX,
  LENGTH_SLIDER_MIN,
  clampLengthForSlider,
  clampLengthInput,
} from "@/lib/length-bounds";

type MatrixSectionProps = {
  title: string;
  children: ReactNode;
};

export function MatrixSection({ title, children }: MatrixSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

type FieldLabelProps = {
  label: string;
  hint?: string;
  htmlFor?: string;
};

export function FieldLabel({ label, hint, htmlFor }: FieldLabelProps) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-zinc-200"
      >
        {label}
      </label>
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </div>
  );
}

type SliderFieldProps = {
  id: string;
  label: string;
  hint?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function SliderField({
  id,
  label,
  hint,
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} hint={hint ?? String(value)} htmlFor={id} />
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="neon-slider h-2 w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

type ToggleChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export function ToggleChip({ label, active, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
          : "border-border-subtle/60 bg-base/50 text-zinc-400 hover:border-border-subtle hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

type LengthFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function LengthField({ id, label, value, onChange }: LengthFieldProps) {
  const sliderValue = clampLengthForSlider(value);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`${id}-input`} className="text-sm font-medium text-zinc-200">
          {label}
        </label>
        <input
          id={`${id}-input`}
          type="number"
          min={LENGTH_INPUT_MIN}
          max={LENGTH_INPUT_MAX}
          value={value}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            if (event.target.value === "") return;
            onChange(clampLengthInput(parsed));
          }}
          className="matrix-length-input w-[4.25rem] rounded-md border border-border-subtle bg-base/80 px-2 py-1 text-right font-mono text-xs text-zinc-100 outline-none ring-accent-cyan/40 focus:ring-2"
          aria-label={`${label} custom value`}
        />
      </div>
      <input
        id={`${id}-slider`}
        type="range"
        min={LENGTH_SLIDER_MIN}
        max={LENGTH_SLIDER_MAX}
        step={1}
        value={sliderValue}
        onChange={(event) => onChange(Number(event.target.value))}
        className="neon-slider h-2 w-full cursor-pointer appearance-none rounded-full"
        aria-valuetext={`${value} characters`}
      />
      {value > LENGTH_SLIDER_MAX ? (
        <p className="text-[10px] text-dr-muted">
          Slider tops at {LENGTH_SLIDER_MAX} — use the number field for longer handles.
        </p>
      ) : null}
    </div>
  );
}

type TextInputFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  onChange: (value: string) => void;
};

export function TextInputField({
  id,
  label,
  value,
  placeholder,
  maxLength = 8,
  onChange,
}: TextInputFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} htmlFor={id} />
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-border-subtle bg-base/80 px-3 py-2 font-mono text-sm text-zinc-100 outline-none ring-accent-cyan/40 focus:ring-2"
      />
    </div>
  );
}
