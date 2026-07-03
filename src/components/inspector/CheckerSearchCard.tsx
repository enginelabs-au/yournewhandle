"use client";

import { useEffect, useState } from "react";
import { User, Search, Square, Zap } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { normalizeHandleForCheck } from "@/lib/checker/constants";
import type { CheckReport } from "@/lib/checker/orchestrator";
import type { CheckMode } from "@/lib/platforms-registry";
import { CheckProgressBar } from "@/components/inspector/CheckProgressBar";

type CheckerSearchCardProps = {
  onSubmit: (handle: string, mode: CheckMode) => void;
  onStop: () => void;
  onInputFocus?: () => void;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  report: CheckReport | null;
  selectedHandle: string | null;
  embedded?: boolean;
  hideProgress?: boolean;
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
  hideProgress = false,
}: CheckerSearchCardProps) {
  const { t } = useAppPreferences();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [fallbackStartedAt, setFallbackStartedAt] = useState<number | null>(null);
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

  useEffect(() => {
    if (report?.isRunning && !report.startedAt) {
      setFallbackStartedAt(Date.now());
    } else if (!report?.isRunning) {
      setFallbackStartedAt(null);
    }
  }, [report?.isRunning, report?.startedAt]);

  const setValue = (next: string) => {
    if (isControlled) {
      onValueChange?.(next);
    } else {
      setInternalValue(next);
    }
  };

  const submitWithMode = (mode: CheckMode) => {
    const normalized = normalizeHandleForCheck(value.trim());
    if (!normalized) return;
    onSubmit(normalized, mode);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitWithMode("light");
  };

  const isRunning = report?.isRunning ?? false;
  const progress = report?.progress ?? { current: 0, total: 0 };
  const startedAt = report?.startedAt ?? fallbackStartedAt ?? Date.now();

  const inner = (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            className="dr-btn-stop inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"
          >
            <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            {t("stop")}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className="dr-btn-check inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              {t("lightCheck")}
            </button>
            <button
              type="button"
              disabled={disabled || !value.trim()}
              onClick={() => submitWithMode("deep")}
              className="dr-btn-deep-check inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-950/30 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 shrink-0" aria-hidden />
              {t("deepCheck")}
            </button>
          </div>
        )}
      </form>

      {isRunning && !hideProgress ? (
        <div className="mt-4">
          <CheckProgressBar
            current={progress.current}
            total={progress.total}
            startedAt={startedAt}
            label={`${report?.mode === "deep" ? t("deepCheck") : t("lightCheck")} · ${t("checkingPlatforms", {
              current: progress.current,
              total: progress.total,
            })}`}
            onStop={onStop}
            showStop={false}
          />
        </div>
      ) : selectedHandle ? (
        <p className="mt-3 font-mono text-xs text-dr-muted">
          <span className="text-dr-purple-light">@{selectedHandle}</span>
          {report?.mode ? (
            <span className="ml-2 text-[10px] uppercase tracking-wide text-cyan-300/70">
              {report.mode === "deep" ? t("deepCheck") : t("lightCheck")}
            </span>
          ) : null}
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
