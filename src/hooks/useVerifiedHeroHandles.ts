"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_COOL_HANDLES } from "@/lib/hero-handles";
import { generateHeroBatch } from "@/lib/hero-generate";
import { isHandleVerifiedForHero } from "@/lib/hero-verify";
import type { GenerationParams } from "@/lib/types";

export const HERO_ROTATE_MS = 2600;
export const HERO_ANIM_MS = 280;

const GENERATE_BATCH_SIZE = 8;
const QUEUE_TARGET = 12;
const VERIFY_CONCURRENCY = 5;
const PUMP_IDLE_MS = 400;

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

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

export function useVerifiedHeroHandles(heroParams: GenerationParams) {
  const [displayHandle, setDisplayHandle] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [animating, setAnimating] = useState(false);

  const queueRef = useRef<string[]>([]);
  const displayRef = useRef<string | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const coolIndexRef = useRef(0);

  const enqueueVerified = useCallback((handle: string) => {
    if (seenRef.current.has(handle)) {
      return;
    }
    seenRef.current.add(handle);

    if (!displayRef.current) {
      displayRef.current = handle;
      setDisplayHandle(handle);
      setIsReady(true);
      return;
    }

    if (handle !== displayRef.current) {
      queueRef.current.push(handle);
    }
  }, []);

  const verifyBatch = useCallback(
    async (handles: string[], signal: AbortSignal) => {
      await runPool(
        handles.filter((h) => !seenRef.current.has(h)),
        async (handle) => {
          if (signal.aborted || seenRef.current.has(handle)) {
            return;
          }
          const ok = await isHandleVerifiedForHero(handle, signal);
          if (ok && !signal.aborted) {
            enqueueVerified(handle);
          }
        },
        VERIFY_CONCURRENCY,
      );
    },
    [enqueueVerified],
  );

  const nextCandidateBatch = useCallback((): string[] => {
      const batch: string[] = [];
      const cool = [...HERO_COOL_HANDLES];

      for (let i = 0; i < 4 && coolIndexRef.current < cool.length; i += 1) {
        batch.push(cool[coolIndexRef.current]!);
        coolIndexRef.current += 1;
      }

      batch.push(...generateHeroBatch(heroParams, GENERATE_BATCH_SIZE));
      return batch.filter((h) => !seenRef.current.has(h));
    },
    [heroParams],
  );

  const advanceHandle = useCallback(() => {
    while (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      if (next !== displayRef.current) {
        displayRef.current = next;
        setDisplayHandle(next);
        return;
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    queueRef.current = [];
    displayRef.current = null;
    seenRef.current = new Set();
    coolIndexRef.current = 0;
    setDisplayHandle(null);
    setIsReady(false);
    setAnimating(false);

    async function pumpGenerated(): Promise<void> {
      while (!signal.aborted) {
        if (queueRef.current.length >= QUEUE_TARGET) {
          await sleep(PUMP_IDLE_MS, signal);
          continue;
        }

        const candidates = nextCandidateBatch();
        if (candidates.length === 0) {
          await sleep(PUMP_IDLE_MS, signal);
          continue;
        }

        await verifyBatch(candidates, signal);
      }
    }

    async function pumpCoolHandles(): Promise<void> {
      await verifyBatch([...HERO_COOL_HANDLES], signal);
    }

    void pumpCoolHandles();
    void pumpGenerated();

    return () => controller.abort();
  }, [heroParams, nextCandidateBatch, verifyBatch]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const interval = window.setInterval(() => {
      if (queueRef.current.length === 0) {
        return;
      }

      setAnimating(true);
      window.setTimeout(() => {
        advanceHandle();
        setAnimating(false);
      }, HERO_ANIM_MS);
    }, HERO_ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [isReady, advanceHandle]);

  return {
    displayHandle,
    isReady,
    animating,
  };
}
