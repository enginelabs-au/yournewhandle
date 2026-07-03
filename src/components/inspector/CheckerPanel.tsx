"use client";

import { useMemo, useState } from "react";
import type { CheckReport } from "@/lib/checker/orchestrator";
import { PlatformTile } from "@/components/inspector/PlatformTile";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import {
  FILTER_TABS,
  PLATFORM_COUNT,
  PLATFORM_REGISTRY,
  countPlatformsByCategory,
  platformCheckResult,
  type PlatformCategory,
} from "@/lib/platforms-registry";
import type { MessageKey } from "@/lib/i18n/languages";

const FILTER_TAB_KEYS: Record<PlatformCategory | "All", MessageKey> = {
  All: "filterAll",
  Social: "filterSocial",
  Messaging: "filterMessaging",
  Video: "filterVideo",
  Coding: "filterCoding",
  Gaming: "filterGaming",
  Professional: "filterPro",
  Music: "filterMusic",
  Other: "filterOther",
};

type CheckerPanelProps = {
  report: CheckReport | null;
  selectedHandle: string | null;
};

export function CheckerPanel({
  report,
  selectedHandle,
}: CheckerPanelProps) {
  const { t } = useAppPreferences();
  const [filter, setFilter] = useState<PlatformCategory | "All">("All");

  const platforms = useMemo(() => {
    if (!report?.platforms.length) {
      return PLATFORM_REGISTRY.map((p) =>
        platformCheckResult(p, { profileUrl: p.visitUrl }),
      );
    }
    if (filter === "All") return report.platforms;
    return report.platforms.filter((p) => p.category === filter);
  }, [report, filter]);

  const categoryCounts = countPlatformsByCategory(
    report?.platforms.length
      ? report.platforms
      : PLATFORM_REGISTRY.map((p) => ({ category: p.category })),
  );

  return (
    <div id="results" className="space-y-3">
      <div className="check-results-header flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/20 bg-cyan-950/20 px-3 py-2.5">
        <h3 className="font-mono text-xs">
          {selectedHandle ? (
            <>
              <span className="text-dr-muted">@</span>
              <span className="text-cyan-200">{selectedHandle}</span>
            </>
          ) : (
            <span className="text-cyan-200/80">
              {t("platformsReady", { count: PLATFORM_COUNT })}
            </span>
          )}
        </h3>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {FILTER_TABS.map((tab) => {
          const count = categoryCounts[tab.id] ?? 0;
          if (tab.id !== "All" && count === 0) return null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`check-filter-chip shrink-0 ${filter === tab.id ? "check-filter-chip-active" : ""}`}
            >
              {t(FILTER_TAB_KEYS[tab.id])}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {report?.error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-sm text-rose-300">
          {report.error}
        </p>
      ) : null}

      <div className="check-tile-grid grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {platforms.map((platform, index) => (
          <PlatformTile key={platform.platformId} platform={platform} index={index} />
        ))}
      </div>
    </div>
  );
}
