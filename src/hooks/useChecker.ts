"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelChecker,
  runChecker,
  emptyReport,
  loadingReport,
  type CheckReport,
} from "@/lib/checker/orchestrator";
import {
  platformCountForCheckMode,
  type CheckMode,
} from "@/lib/platforms-registry";

export function useChecker() {
  const [selectedHandle, setSelectedHandle] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [checkMode, setCheckMode] = useState<CheckMode>("light");
  const [report, setReport] = useState<CheckReport | null>(null);
  const checkModeRef = useRef<CheckMode>("light");

  const selectHandle = useCallback(
    (
      handle: string,
      candidateId: string | null = null,
      mode: CheckMode = "light",
    ) => {
      checkModeRef.current = mode;
      setCheckMode(mode);
      setSelectedHandle(handle);
      setSelectedCandidateId(candidateId);
      setReport(loadingReport(handle, platformCountForCheckMode(mode), mode));
      runChecker(handle, setReport, mode);
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
      runChecker(selectedHandle, setReport, checkModeRef.current);
    }
  }, [selectedHandle]);

  return {
    selectedHandle,
    selectedCandidateId,
    checkMode,
    report: report ?? (selectedHandle ? emptyReport(selectedHandle, checkMode) : null),
    selectHandle,
    stopChecks,
    clearSelection,
    rerunChecks,
  };
}
