"use client";

import { useEffect, useState } from "react";
import { User, Search, Square, Loader2 } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { normalizeHandleForCheck } from "@/lib/checker/constants";
import type { CheckReport } from "@/lib/checker/orchestrator";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";

type CheckerSearchCardProps = {
  onSubmit: (handle: string) => void;
  onStop: () => void;
  onInputFocus?: () => void;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  report: CheckReport | null;
  selectedHandle: string | null;
  embedded?: boolean;
};

export function CheckerSearchCard({
  onSubmit,
  onStop,
  onInputFocus,
  disabled,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  report,
  selectedHandle,
  embedded = false,
}: CheckerSearchCardProps) {
  const { t } = useAppPreferences();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  useEffect(() => {
    if (!selectedHandle) return;
    if (isControlled) {
      onValueChange?.(selectedHandle);
    } else {
      setInternalValue(selectedHandle);
    }
  }, [selectedHandle, isControlled, onValueChange]);

  const setValue = (next: string) => {
    if (isControlled) {
      onValueChange?.(next);
    } else {
      setInternalValue(next);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = normalizeHandleForCheck(value.trim());
    if (!normalized) return;
    onSubmit(normalized);
  };

  const isRunning = report?.isRunning ?? false;
  const progress = report?.progress ?? { current: 0, total: PLATFORM_COUNT };
  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  const inner = (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <User
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dr-muted"
            aria-hidden
          />
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={onInputFocus}
            placeholder={t("placeholder")}
            disabled={disabled || isRunning}
            className="dr-input dr-input-glow w-full rounded-lg py-3 pl-11 pr-4 font-mono text-sm disabled:opacity-50"
          />
        </div>
        {isRunning ? (
          <button
            type="button"
            onClick={onStop}
            className="dr-btn-stop inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold sm:min-w-[120px]"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            {t("stop")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="dr-btn-check inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold sm:min-w-[120px]"
          >
            <Search className="h-4 w-4" aria-hidden />
            {t("checkAction")}
          </button>
        )}
      </form>

      {isRunning ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-dr-muted">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              {t("checkingPlatforms", {
                current: progress.current,
                total: progress.total,
              })}
            </span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="dr-progress-track h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="dr-progress-fill dr-progress-shimmer h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : selectedHandle ? (
        <p className="mt-3 font-mono text-xs text-dr-muted">
          <span className="text-dr-purple-light">@{selectedHandle}</span>
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return inner;
  }

  return (
    <section className="dr-search-card rounded-xl border border-dr-border bg-dr-panel/90 p-5 sm:p-6">
      {inner}
    </section>
  );
}
