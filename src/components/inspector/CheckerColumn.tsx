"use client";

import { useEffect, useRef, useState } from "react";
import type { CheckReport } from "@/lib/checker/orchestrator";
import type {
  BatchCheckProgress,
  BatchPlatformResults,
} from "@/hooks/useBatchAvailability";
import { CheckerSearchCard } from "@/components/inspector/CheckerSearchCard";
import { CheckExportBar } from "@/components/inspector/CheckExportBar";
import { CheckerStats } from "@/components/inspector/CheckerStats";
import { CheckerPanel } from "@/components/inspector/CheckerPanel";
import { BatchCheckQueue } from "@/components/inspector/BatchCheckQueue";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";
import type { Candidate } from "@/lib/types";

type CheckResultsView = "batch" | "catalog";

type CheckerColumnProps = {
  selectedHandle: string | null;
  report: CheckReport | null;
  checkDraft: string;
  onCheckDraftChange: (value: string) => void;
  onSubmit: (handle: string, mode: import("@/lib/platforms-registry").CheckMode) => void;
  onStop: () => void;
  onRetry: () => void;
  onInputFocus?: () => void;
  disabled?: boolean;
  pipelineActive?: boolean;
  batchCandidates?: Candidate[];
  batchPlatformResults?: BatchPlatformResults;
  batchProgress?: BatchCheckProgress | null;
  isBatchChecking?: boolean;
};

export function CheckerColumn({
  selectedHandle,
  report,
  checkDraft,
  onCheckDraftChange,
  onSubmit,
  onStop,
  onRetry,
  onInputFocus,
  disabled,
  pipelineActive,
  batchCandidates = [],
  batchPlatformResults = {},
  batchProgress = null,
  isBatchChecking = false,
}: CheckerColumnProps) {
  const { t } = useAppPreferences();
  const showBatchView = batchCandidates.length > 0;
  const [resultsView, setResultsView] = useState<CheckResultsView>("batch");
  const prevBatchCountRef = useRef(0);

  useEffect(() => {
    if (batchCandidates.length > 0 && prevBatchCountRef.current === 0) {
      setResultsView("batch");
    }
    prevBatchCountRef.current = batchCandidates.length;
  }, [batchCandidates.length]);

  const handleCopy = async () => {
    if (!selectedHandle) return;
    try {
      await navigator.clipboard.writeText(selectedHandle);
    } catch {
      // ignore
    }
  };

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.normalized}-usernames.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!report) return;
    const rows = report.platforms.map((p) => [
      p.name,
      p.category,
      p.status,
      p.message ?? "",
      p.latencyMs?.toString() ?? "",
    ]);
    const csv = [
      "platform,category,status,message,latency_ms",
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.normalized}-usernames.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="checker"
      className={`check-studio-panel flex min-h-[720px] flex-col overflow-hidden lg:min-h-[calc(100vh-14rem)] ${
        pipelineActive ? "pipeline-target-glow" : ""
      }`}
    >
      <div className="check-studio-mesh" aria-hidden />
      <div className="check-studio-accent" aria-hidden />

      <div className="relative flex flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5">
        <div className="check-command-bar check-command-glow shrink-0 space-y-3">
          <CheckerSearchCard
            onSubmit={onSubmit}
            onStop={onStop}
            onInputFocus={onInputFocus}
            disabled={disabled || isBatchChecking}
            value={checkDraft}
            onValueChange={onCheckDraftChange}
            report={showBatchView && resultsView === "batch" ? null : report}
            selectedHandle={
              showBatchView && resultsView === "batch" ? null : selectedHandle
            }
            embedded
            hideProgress={isBatchChecking && resultsView === "batch"}
          />
          {!showBatchView ? (
            <CheckExportBar
              selectedHandle={selectedHandle}
              hasReport={Boolean(report)}
              isRunning={Boolean(report?.isRunning)}
              onCopy={handleCopy}
              onExportJson={handleExportJson}
              onExportCsv={handleExportCsv}
              onRetry={onRetry}
            />
          ) : null}
        </div>

        {showBatchView ? (
          <div
            className="check-results-view-tabs flex shrink-0 gap-1.5"
            role="tablist"
            aria-label={t("batchCheckTitle")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={resultsView === "batch"}
              onClick={() => setResultsView("batch")}
              className={`check-filter-chip shrink-0 ${
                resultsView === "batch" ? "check-filter-chip-active" : ""
              }`}
            >
              {t("checkViewBatch")}
              <span className="opacity-60">{batchCandidates.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={resultsView === "catalog"}
              onClick={() => setResultsView("catalog")}
              className={`check-filter-chip shrink-0 ${
                resultsView === "catalog" ? "check-filter-chip-active" : ""
              }`}
            >
              {t("checkViewAllPlatforms")}
              <span className="opacity-60">{PLATFORM_COUNT}</span>
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden">
          {showBatchView && resultsView === "batch" ? (
            <BatchCheckQueue
              candidates={batchCandidates}
              platformResults={batchPlatformResults}
              progress={batchProgress}
              isRunning={isBatchChecking}
              onStop={onStop}
            />
          ) : (
            <div className="h-full min-h-0 overflow-y-auto">
              {!showBatchView && report && selectedHandle ? (
                <CheckerStats report={report} key={selectedHandle} />
              ) : null}
              <CheckerPanel report={report} selectedHandle={selectedHandle} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
