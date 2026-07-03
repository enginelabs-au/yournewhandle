"use client";

import type { CheckReport } from "@/lib/checker/orchestrator";
import { CheckerSearchCard } from "@/components/inspector/CheckerSearchCard";
import { CheckExportBar } from "@/components/inspector/CheckExportBar";
import { CheckerStats } from "@/components/inspector/CheckerStats";
import { CheckerPanel } from "@/components/inspector/CheckerPanel";

type CheckerColumnProps = {
  selectedHandle: string | null;
  report: CheckReport | null;
  checkDraft: string;
  onCheckDraftChange: (value: string) => void;
  onSubmit: (handle: string) => void;
  onStop: () => void;
  onRetry: () => void;
  onInputFocus?: () => void;
  disabled?: boolean;
  pipelineActive?: boolean;
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
}: CheckerColumnProps) {
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

      <div className="relative flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
        <div className="check-command-bar check-command-glow space-y-3">
          <CheckerSearchCard
            onSubmit={onSubmit}
            onStop={onStop}
            onInputFocus={onInputFocus}
            disabled={disabled}
            value={checkDraft}
            onValueChange={onCheckDraftChange}
            report={report}
            selectedHandle={selectedHandle}
            embedded
          />
          <CheckExportBar
            selectedHandle={selectedHandle}
            hasReport={Boolean(report)}
            isRunning={Boolean(report?.isRunning)}
            onCopy={handleCopy}
            onExportJson={handleExportJson}
            onExportCsv={handleExportCsv}
            onRetry={onRetry}
          />
        </div>

        {report && selectedHandle ? (
          <CheckerStats report={report} key={selectedHandle} />
        ) : null}

        <CheckerPanel report={report} selectedHandle={selectedHandle} />
      </div>
    </div>
  );
}
