"use client";

import type { CheckReport } from "@/lib/checker/orchestrator";
import type { CheckStatus } from "@/lib/types";
import { useAppPreferences } from "@/context/AppPreferencesProvider";

type CheckerStatsProps = {
  report: CheckReport;
};

function countStatus(platforms: { status: CheckStatus }[], statuses: CheckStatus[]): number {
  return platforms.filter((p) => statuses.includes(p.status)).length;
}

export function CheckerStats({ report }: CheckerStatsProps) {
  const { t } = useAppPreferences();
  const platforms = report.platforms;
  const total = platforms.length || 1;

  const available = countStatus(platforms, ["available"]);
  const taken = countStatus(platforms, ["taken"]);
  const unknown = countStatus(platforms, [
    "unknown",
    "verify",
    "idle",
    "loading",
    "error",
  ]);

  const availPct = Math.round((available / total) * 100);
  const takenPct = Math.round((taken / total) * 100);
  const unknownPct = Math.max(0, 100 - availPct - takenPct);

  const items = [
    { label: t("free"), value: available, className: "text-emerald-300", dot: "bg-emerald-400", glow: "shadow-emerald-500/30" },
    { label: t("taken"), value: taken, className: "text-rose-300", dot: "bg-rose-400", glow: "shadow-rose-500/30" },
    {
      label: t("unknown"),
      value: report.isRunning ? "—" : unknown,
      className: "text-amber-300",
      dot: "bg-amber-400",
      glow: "shadow-amber-500/30",
    },
  ];

  return (
    <div className="check-stats-meter stat-card-pop space-y-3 rounded-xl border border-cyan-400/25 p-4">
      <div className="flex h-3 overflow-hidden rounded-full bg-black/40 shadow-inner">
        <div
          className="check-meter-segment bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
          style={{ width: `${availPct}%` }}
        />
        <div
          className="check-meter-segment bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500"
          style={{ width: `${takenPct}%` }}
        />
        <div
          className="check-meter-segment bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
          style={{ width: `${unknownPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`check-stat-pill flex items-center gap-2 rounded-lg px-2.5 py-2 shadow-lg ${item.glow}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${item.dot} shadow-[0_0_8px_currentColor]`} aria-hidden />
            <div className="min-w-0">
              <p className={`text-lg font-bold tabular-nums leading-none ${item.className}`}>
                {item.value}
              </p>
              <p className="text-[10px] text-cyan-200/60">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
