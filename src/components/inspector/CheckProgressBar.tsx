"use client";

import { useEffect, useState } from "react";
import { Loader2, Square } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import {
  estimateRemainingSeconds,
  formatRemainingSeconds,
} from "@/lib/checker/estimate-remaining";

type CheckProgressBarProps = {
  current: number;
  total: number;
  startedAt: number;
  label: string;
  onStop?: () => void;
  showStop?: boolean;
};

export function CheckProgressBar({
  current,
  total,
  startedAt,
  label,
  onStop,
  showStop = true,
}: CheckProgressBarProps) {
  const { t } = useAppPreferences();
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const etaLabel = formatRemainingSeconds(etaSeconds);

  useEffect(() => {
    if (current >= total || total <= 0) {
      setEtaSeconds(null);
      return;
    }

    const tick = () => {
      setEtaSeconds(estimateRemainingSeconds(current, total, startedAt));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [current, total, startedAt]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs text-dr-muted">
        <span className="inline-flex min-w-0 items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 tabular-nums">
          {pct}%
          {etaLabel ? (
            <span className="ml-2 text-cyan-300/80">
              {t("estimatedRemaining", { time: etaLabel })}
            </span>
          ) : null}
        </span>
      </div>
      <div className="dr-progress-track h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="dr-progress-fill dr-progress-shimmer h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showStop && onStop ? (
        <button
          type="button"
          onClick={onStop}
          className="dr-btn-stop inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
        >
          <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
          {t("stop")}
        </button>
      ) : null}
    </div>
  );
}
