"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_GENERATION_PARAMS, type GenerationParams } from "@/lib/types";
import { loadParams, saveParams } from "@/lib/storage";

const SAVE_DEBOUNCE_MS = 500;

function mergeGenerationParams(
  prev: GenerationParams,
  patch: Partial<GenerationParams>,
): GenerationParams {
  return {
    ...prev,
    ...patch,
    syllableCount: patch.syllableCount
      ? { ...prev.syllableCount, ...patch.syllableCount }
      : prev.syllableCount,
    languageWeights: patch.languageWeights
      ? { ...prev.languageWeights, ...patch.languageWeights }
      : prev.languageWeights,
    allowedVowels: patch.allowedVowels
      ? [...patch.allowedVowels]
      : prev.allowedVowels,
    blockedConsonants: patch.blockedConsonants
      ? [...patch.blockedConsonants]
      : prev.blockedConsonants,
  };
}

export function useGenerationParams() {
  const [params, setParamsState] = useState<GenerationParams>(
    DEFAULT_GENERATION_PARAMS,
  );
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setParamsState(loadParams());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const scheduleSave = useCallback((next: GenerationParams) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveParams(next);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const updateParams = useCallback(
    (patch: Partial<GenerationParams>) => {
      setParamsState((prev) => {
        const next = mergeGenerationParams(prev, patch);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const setParams = useCallback(
    (next: GenerationParams) => {
      setParamsState(next);
      scheduleSave(next);
    },
    [scheduleSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return { params, updateParams, setParams, hydrated };
}
