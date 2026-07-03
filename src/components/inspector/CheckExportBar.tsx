"use client";

import { Copy, Download, RefreshCw } from "lucide-react";

type CheckExportBarProps = {
  selectedHandle: string | null;
  hasReport: boolean;
  isRunning: boolean;
  onCopy: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onRetry: () => void;
};

export function CheckExportBar({
  selectedHandle,
  hasReport,
  isRunning,
  onCopy,
  onExportJson,
  onExportCsv,
  onRetry,
}: CheckExportBarProps) {
  if (!selectedHandle || !hasReport || isRunning) {
    return null;
  }

  return (
    <div className="check-export-bar flex flex-wrap items-center gap-2">
      <button type="button" onClick={onCopy} className="check-export-btn">
        <Copy className="h-3.5 w-3.5" aria-hidden />
        Copy
      </button>
      <button type="button" onClick={onExportJson} className="check-export-btn">
        <Download className="h-3.5 w-3.5" aria-hidden />
        JSON
      </button>
      <button type="button" onClick={onExportCsv} className="check-export-btn">
        <Download className="h-3.5 w-3.5" aria-hidden />
        CSV
      </button>
      <button type="button" onClick={onRetry} className="check-export-btn">
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        Retry
      </button>
    </div>
  );
}
