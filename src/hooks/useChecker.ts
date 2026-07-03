"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelChecker,
  runChecker,
  emptyReport,
  loadingReport,
  type CheckReport,
} from "@/lib/checker/orchestrator";
import { PLATFORM_REGISTRY } from "@/lib/platforms-registry";

export function useChecker() {
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [report, setReport] = useState<CheckReport | null>(null);

  const selectHandle = useCallback(
    (handle: string, candidateId: string | null = null) => {
      setSelectedHandle(handle);
      setSelectedCandidateId(candidateId);
      setReport(loadingReport(handle, PLATFORM_REGISTRY.length));
      runChecker(handle, setReport);
    },
    [],
  );

  const stopChecks = useCallback(() => {
    cancelChecker();
    setReport((prev) =>
      prev ? { ...prev, isRunning: false } : null,
    );
  }, []);

  const clearSelection = useCallback(() => {
    cancelChecker();
    setSelectedHandle(null);
    setSelectedCandidateId(null);
    setReport(null);
  }, []);

  useEffect(() => () => cancelChecker(), []);

  const rerunChecks = useCallback(() => {
    if (selectedHandle) {
      runChecker(selectedHandle, setReport);
    }
  }, [selectedHandle]);

  return {
    selectedHandle,
    selectedCandidateId,
    report: report ?? (selectedHandle ? emptyReport(selectedHandle) : null),
    selectHandle,
    stopChecks,
    clearSelection,
    rerunChecks,
  };
}
