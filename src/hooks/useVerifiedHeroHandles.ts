"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateHeroBatch, generateHeroHandle } from "@/lib/hero-generate";
import { isHandleLightAvailable } from "@/lib/hero-light-check";
import type { GenerationParams } from "@/lib/types";

export const HERO_ROTATE_MS = 2600;
export const HERO_ANIM_MS = 280;

const LIST_TARGET = 8;
const PREFETCH_WHEN_REMAINING = 3;
const VERIFY_CONCURRENCY = 6;
const MAX_LIST_BUILD_ROUNDS = 6;

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

type BuildListOptions = {
  heroParams: GenerationParams;
  targetCount: number;
  signal: AbortSignal;
  seen: Set<string>;
  onFound?: (handle: string) => void;
};

async function buildAvailableList({
  heroParams,
  targetCount,
  signal,
  seen,
  onFound,
}: BuildListOptions): Promise<string[]> {
  const available: string[] = [];

  for (let round = 0; round < MAX_LIST_BUILD_ROUNDS; round += 1) {
    if (signal.aborted || available.length >= targetCount) {
      break;
    }

    const candidates = generateHeroBatch(heroParams, 12).filter((handle) => {
      if (seen.has(handle)) {
        return false;
      }
      seen.add(handle);
      return true;
    });

    if (candidates.length === 0) {
      continue;
    }

    await runPool(
      candidates,
      async (handle) => {
        if (signal.aborted || available.length >= targetCount) {
          return;
        }

        const ok = await isHandleLightAvailable(handle, signal);
        if (!ok || signal.aborted) {
          return;
        }

        available.push(handle);
        onFound?.(handle);
      },
      VERIFY_CONCURRENCY,
    );
  }

  return available;
}

export function useVerifiedHeroHandles(heroParams: GenerationParams) {
  const [displayHandle, setDisplayHandle] = useState(() =>
    generateHeroHandle(heroParams),
  );
  const [animating, setAnimating] = useState(false);
  const [usingVerifiedLists, setUsingVerifiedLists] = useState(false);

  const heroParamsRef = useRef(heroParams);
  heroParamsRef.current = heroParams;

  const activeListRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const seenRef = useRef<Set<string>>(new Set());
  const nextListRef = useRef<Promise<string[]> | null>(null);
  const usingVerifiedRef = useRef(false);
  const sessionAbortRef = useRef<AbortController | null>(null);

  const rotateFallback = useCallback(() => {
    setDisplayHandle(generateHeroHandle(heroParamsRef.current));
  }, []);

  const startNextListPrefetch = useCallback((signal: AbortSignal) => {
    if (nextListRef.current) {
      return;
    }

    nextListRef.current = buildAvailableList({
      heroParams: heroParamsRef.current,
      targetCount: LIST_TARGET,
      signal,
      seen: seenRef.current,
    })
      .catch(() => [] as string[])
      .finally(() => {
        nextListRef.current = null;
      });
  }, []);

  const activateVerifiedList = useCallback(
    (list: string[], signal: AbortSignal) => {
      if (list.length === 0 || usingVerifiedRef.current) {
        return;
      }

      activeListRef.current = list;
      indexRef.current = 0;
      usingVerifiedRef.current = true;
      setUsingVerifiedLists(true);
      setDisplayHandle(list[0]!);
      startNextListPrefetch(signal);
    },
    [startNextListPrefetch],
  );

  const appendToActiveList = useCallback((handle: string) => {
    if (!activeListRef.current.includes(handle)) {
      activeListRef.current.push(handle);
    }
  }, []);

  const advanceVerified = useCallback(async () => {
    const list = activeListRef.current;
    if (list.length === 0) {
      return;
    }

    const remaining = list.length - indexRef.current - 1;
    const signal = sessionAbortRef.current?.signal;
    if (remaining <= PREFETCH_WHEN_REMAINING && signal && !signal.aborted) {
      startNextListPrefetch(signal);
    }

    let nextIndex = indexRef.current + 1;

    if (nextIndex >= list.length) {
      const pending = nextListRef.current;
      if (!pending) {
        if (signal && !signal.aborted) {
          startNextListPrefetch(signal);
        }
        return;
      }

      const nextList = await pending;
      if (nextList.length === 0) {
        return;
      }

      activeListRef.current = nextList;
      indexRef.current = 0;
      nextIndex = 0;

      if (signal && !signal.aborted) {
        startNextListPrefetch(signal);
      }
    }

    indexRef.current = nextIndex;
    const nextHandle = activeListRef.current[nextIndex];
    if (nextHandle) {
      setDisplayHandle(nextHandle);
    }
  }, [startNextListPrefetch]);

  useEffect(() => {
    sessionAbortRef.current?.abort();

    const controller = new AbortController();
    sessionAbortRef.current = controller;
    const { signal } = controller;

    activeListRef.current = [];
    indexRef.current = 0;
    nextListRef.current = null;
    seenRef.current = new Set();
    usingVerifiedRef.current = false;
    setUsingVerifiedLists(false);
    setDisplayHandle(generateHeroHandle(heroParams));
    setAnimating(false);

    void (async () => {
      const list = await buildAvailableList({
        heroParams,
        targetCount: LIST_TARGET,
        signal,
        seen: seenRef.current,
        onFound: (handle) => {
          if (signal.aborted) {
            return;
          }

          if (!usingVerifiedRef.current) {
            activateVerifiedList([handle], signal);
            return;
          }

          appendToActiveList(handle);
        },
      });

      if (signal.aborted) {
        return;
      }

      if (list.length === 0) {
        return;
      }

      if (!usingVerifiedRef.current) {
        activateVerifiedList(list, signal);
        return;
      }

      for (const handle of list) {
        appendToActiveList(handle);
      }
    })();

    return () => controller.abort();
  }, [heroParams, activateVerifiedList, appendToActiveList]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setAnimating(true);
      window.setTimeout(() => {
        if (usingVerifiedRef.current) {
          void advanceVerified().finally(() => setAnimating(false));
        } else {
          rotateFallback();
          setAnimating(false);
        }
      }, HERO_ANIM_MS);
    }, HERO_ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [advanceVerified, rotateFallback]);

  return {
    displayHandle,
    animating,
    usingVerifiedLists,
  };
}
