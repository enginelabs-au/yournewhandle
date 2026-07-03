"use client";

import { useMemo, useState } from "react";
import type { CheckReport } from "@/lib/checker/orchestrator";
import { CheckerCategorySection } from "@/components/inspector/CheckerCategorySection";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import {
  DEFAULT_OPEN_CATEGORIES,
  groupPlatformsByCategory,
} from "@/lib/checker/category-groups";
import {
  FILTER_TABS,
  PLATFORM_COUNT,
  POPULAR_PLATFORM_IDS,
  mergeReportIntoAllPlatforms,
  countPlatformsByCategory,
  type PlatformCategory,
} from "@/lib/platforms-registry";

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

  const allPlatforms = useMemo(() => {
    const handle = report?.normalized ?? selectedHandle ?? "";
    if (report?.platforms.length) {
      return mergeReportIntoAllPlatforms(handle, report.platforms);
    }
    return mergeReportIntoAllPlatforms(handle, []);
  }, [report, selectedHandle]);

  const filteredPlatforms = useMemo(() => {
    if (filter === "All") {
      return allPlatforms;
    }
    if (filter === "Popular") {
      return allPlatforms.filter((platform) =>
        POPULAR_PLATFORM_IDS.has(platform.platformId),
      );
    }
    return allPlatforms.filter((platform) => platform.category === filter);
  }, [allPlatforms, filter]);

  const categoryGroups = useMemo(
    () => groupPlatformsByCategory(filteredPlatforms),
    [filteredPlatforms],
  );

  const categoryCounts = countPlatformsByCategory(allPlatforms);

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
        {report?.mode ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-cyan-300/70">
            {report.mode === "deep" ? t("deepCheck") : t("lightCheck")}
          </span>
        ) : null}
        {filter !== "All" ? (
          <span className="text-[10px] font-medium text-cyan-200/70">
            {filteredPlatforms.length} in {filter}
          </span>
        ) : null}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {FILTER_TABS.map((tab) => {
          const count = categoryCounts[tab.id] ?? 0;
          if (tab.id !== "All" && count === 0) {
            return null;
          }
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`check-filter-chip shrink-0 ${filter === tab.id ? "check-filter-chip-active" : ""}`}
            >
              {tab.id === "All" ? t("filterAll") : tab.label}
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

      <div className="check-category-stack space-y-2">
        {categoryGroups.map((group) => (
          <CheckerCategorySection
            key={group.category}
            category={group.category}
            platforms={group.platforms}
            defaultOpen={DEFAULT_OPEN_CATEGORIES.has(group.category)}
            forceOpen={filter !== "All"}
          />
        ))}
      </div>
    </div>
  );
}
