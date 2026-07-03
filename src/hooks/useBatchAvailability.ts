"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { estimateRemainingSeconds } from "@/lib/checker/estimate-remaining";
import { checkHandlePlatforms } from "@/lib/checker/orchestrator";
import {
  platformCountForCheckMode,
  type CheckMode,
} from "@/lib/platforms-registry";
import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { CheckStatus } from "@/lib/types";
import type { Candidate } from "@/lib/types";

/** platformId → candidateId → check status */
export type BatchPlatformResults = Record<string, Record<string, CheckStatus>>;

export type BatchCheckProgress = {
  completedPlatforms: number;
  totalPlatforms: number;
  completedHandles: number;
  totalHandles: number;
  startedAt: number;
  estimatedRemainingSeconds: number | null;
};

const HANDLE_CONCURRENCY = 6;
/** Fast batch: top 50 popular platforms. Use Deep Check on a handle for all 463. */
const BATCH_CHECK_MODE: CheckMode = "light";
const BATCH_PLATFORM_COUNT = platformCountForCheckMode(BATCH_CHECK_MODE);

type UseBatchAvailabilityArgs = {
  onFocusCheck?: () => void;
};

async function runPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await worker(items[index]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () =>
      runWorker(),
    ),
  );
}

function mergePlatformSlice(
  prev: BatchPlatformResults,
  candidateId: string,
  platforms: PlatformCheckResult[],
): BatchPlatformResults {
  let changed = false;
  const next: BatchPlatformResults = { ...prev };

  for (const platform of platforms) {
    if (platform.status === "loading" || platform.status === "idle") {
      continue;
    }
    const existing = next[platform.platformId]?.[candidateId];
    if (existing === platform.status) {
      continue;
    }
    if (!next[platform.platformId]) {
      next[platform.platformId] = {};
    } else {
      next[platform.platformId] = { ...next[platform.platformId] };
    }
    next[platform.platformId]![candidateId] = platform.status;
    changed = true;
  }

  return changed ? next : prev;
}

export function useBatchAvailability({ onFocusCheck }: UseBatchAvailabilityArgs = {}) {
  const [isBatchChecking, setIsBatchChecking] = useState(false);
  const [batchCandidates, setBatchCandidates] = useState<Candidate[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchCheckProgress | null>(
    null,
  );
  const [batchPlatformResults, setBatchPlatformResults] =
    useState<BatchPlatformResults>({});

  const controllerRef = useRef<AbortController | null>(null);
  const progressRef = useRef({
    completedPlatforms: 0,
    completedHandles: 0,
    startedAt: 0,
    totalHandles: 0,
    totalPlatforms: 0,
  });

  const syncProgress = useCallback(() => {
    const snapshot = progressRef.current;
    setBatchProgress({
      completedPlatforms: snapshot.completedPlatforms,
      totalPlatforms: snapshot.totalPlatforms,
      completedHandles: snapshot.completedHandles,
      totalHandles: snapshot.totalHandles,
      startedAt: snapshot.startedAt,
      estimatedRemainingSeconds: estimateRemainingSeconds(
        snapshot.completedPlatforms,
        snapshot.totalPlatforms,
        snapshot.startedAt,
      ),
    });
  }, []);

  const applyPlatformSlice = useCallback(
    (candidateId: string, platforms: PlatformCheckResult[]) => {
      setBatchPlatformResults((prev) =>
        mergePlatformSlice(prev, candidateId, platforms),
      );
    },
    [],
  );

  const cancelBatchCheck = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsBatchChecking(false);
  }, []);

  const clearAvailability = useCallback(() => {
    cancelBatchCheck();
    setBatchCandidates([]);
    setBatchProgress(null);
    setBatchPlatformResults({});
  }, [cancelBatchCheck]);

  const checkCandidatesBatch = useCallback(
    async (candidates: Candidate[]) => {
      if (!candidates.length) {
        return;
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const totalPlatforms = candidates.length * BATCH_PLATFORM_COUNT;
      const startedAt = Date.now();
      progressRef.current = {
        completedPlatforms: 0,
        completedHandles: 0,
        startedAt,
        totalHandles: candidates.length,
        totalPlatforms,
      };

      setIsBatchChecking(true);
      setBatchCandidates(candidates);
      setBatchPlatformResults({});
      syncProgress();

      onFocusCheck?.();
      document.getElementById("checker")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      try {
        await runPool(
          candidates,
          async (candidate) => {
            if (controller.signal.aborted) {
              return;
            }

            let lastCompleted = 0;

            const platforms = await checkHandlePlatforms(
              candidate.normalized,
              BATCH_CHECK_MODE,
              controller.signal,
              (completed, _total, partialPlatforms) => {
                if (controller.signal.aborted) {
                  return;
                }

                const delta = completed - lastCompleted;
                lastCompleted = completed;
                if (delta > 0) {
                  progressRef.current.completedPlatforms += delta;
                  syncProgress();
                }

                applyPlatformSlice(candidate.id, partialPlatforms);
              },
            );

            if (controller.signal.aborted) {
              return;
            }

            applyPlatformSlice(candidate.id, platforms);

            const remainingPlatforms = BATCH_PLATFORM_COUNT - lastCompleted;
            if (remainingPlatforms > 0) {
              progressRef.current.completedPlatforms += remainingPlatforms;
            }
            progressRef.current.completedHandles += 1;
            syncProgress();
          },
          HANDLE_CONCURRENCY,
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsBatchChecking(false);
        }
        controllerRef.current = null;
      }
    },
    [applyPlatformSlice, onFocusCheck, syncProgress],
  );

  useEffect(() => () => cancelBatchCheck(), [cancelBatchCheck]);

  return {
    isBatchChecking,
    batchCandidates,
    batchProgress,
    batchPlatformResults,
    checkCandidatesBatch,
    cancelBatchCheck,
    clearAvailability,
  };
}
