"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateHeroBatch } from "@/lib/hero-generate";
import { isHandleVerifiedForHero } from "@/lib/hero-verify";
import type { GenerationParams } from "@/lib/types";

export const HERO_ROTATE_MS = 2600;
export const HERO_ANIM_MS = 280;

const BATCH_GENERATE_COUNT = 10;
const PREFETCH_WHEN_REMAINING = 3;
const VERIFY_CONCURRENCY = 2;
const MAX_EMPTY_BATCH_ATTEMPTS = 5;

async function runPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await worker(items[index]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );
}

async function verifyCandidates(
  handles: string[],
  signal: AbortSignal,
): Promise<string[]> {
  const verified: string[] = [];

  await runPool(
    handles,
    async (handle) => {
      if (signal.aborted) {
        return;
      }
      const ok = await isHandleVerifiedForHero(handle, signal);
      if (ok && !signal.aborted) {
        verified.push(handle);
      }
    },
    VERIFY_CONCURRENCY,
  );

  return verified;
}

async function buildVerifiedBatch(
  heroParams: GenerationParams,
  signal: AbortSignal,
): Promise<string[]> {
  for (let attempt = 0; attempt < MAX_EMPTY_BATCH_ATTEMPTS; attempt += 1) {
    if (signal.aborted) {
      return [];
    }

    const candidates = generateHeroBatch(heroParams, BATCH_GENERATE_COUNT);
    const verified = await verifyCandidates(candidates, signal);
    if (verified.length > 0) {
      return verified;
    }
  }

  return [];
}

export function useVerifiedHeroHandles(heroParams: GenerationParams) {
  const [displayHandle, setDisplayHandle] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [animating, setAnimating] = useState(false);

  const poolRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const nextBatchRef = useRef<Promise<string[]> | null>(null);
  const prefetchAbortRef = useRef<AbortController | null>(null);
  const sessionAbortRef = useRef<AbortController | null>(null);

  const startPrefetch = useCallback(() => {
    if (nextBatchRef.current) {
      return;
    }

    const remaining = poolRef.current.length - indexRef.current;
    if (remaining > PREFETCH_WHEN_REMAINING) {
      return;
    }

    prefetchAbortRef.current?.abort();
    const controller = new AbortController();
    prefetchAbortRef.current = controller;

    nextBatchRef.current = buildVerifiedBatch(heroParams, controller.signal)
      .catch(() => [] as string[])
      .finally(() => {
        nextBatchRef.current = null;
        if (prefetchAbortRef.current === controller) {
          prefetchAbortRef.current = null;
        }
      });
  }, [heroParams]);

  const loadNextPool = useCallback(async (): Promise<boolean> => {
    let batchPromise = nextBatchRef.current;
    if (!batchPromise) {
      batchPromise = buildVerifiedBatch(
        heroParams,
        sessionAbortRef.current?.signal ?? new AbortController().signal,
      );
    }

    const batch = await batchPromise;
    if (sessionAbortRef.current?.signal.aborted) {
      return false;
    }

    if (batch.length === 0) {
      return false;
    }

    poolRef.current = batch;
    indexRef.current = 0;
    startPrefetch();
    return true;
  }, [heroParams, startPrefetch]);

  const advanceHandle = useCallback(async () => {
    if (!sessionAbortRef.current || sessionAbortRef.current.signal.aborted) {
      return;
    }

    const pool = poolRef.current;
    let nextIndex = indexRef.current + 1;

    if (nextIndex >= pool.length) {
      const loaded = await loadNextPool();
      if (!loaded) {
        return;
      }
      nextIndex = 0;
    } else {
      startPrefetch();
    }

    indexRef.current = nextIndex;
    setDisplayHandle(poolRef.current[nextIndex] ?? null);
  }, [loadNextPool, startPrefetch]);

  useEffect(() => {
    sessionAbortRef.current?.abort();
    prefetchAbortRef.current?.abort();

    const controller = new AbortController();
    sessionAbortRef.current = controller;

    poolRef.current = [];
    indexRef.current = 0;
    nextBatchRef.current = null;
    setIsReady(false);
    setDisplayHandle(null);
    setAnimating(false);

    void (async () => {
      const batch = await buildVerifiedBatch(heroParams, controller.signal);
      if (controller.signal.aborted) {
        return;
      }

      if (batch.length === 0) {
        return;
      }

      poolRef.current = batch;
      indexRef.current = 0;
      setDisplayHandle(batch[0] ?? null);
      setIsReady(true);
      startPrefetch();
    })();

    return () => {
      controller.abort();
      prefetchAbortRef.current?.abort();
    };
  }, [heroParams, startPrefetch]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const interval = window.setInterval(() => {
      setAnimating(true);
      window.setTimeout(() => {
        void advanceHandle().finally(() => setAnimating(false));
      }, HERO_ANIM_MS);
    }, HERO_ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [isReady, advanceHandle]);

  return {
    displayHandle,
    isReady,
    animating,
    isVerifying: !isReady,
  };
}
