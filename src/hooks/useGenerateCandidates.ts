"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateBatch } from "@/lib/engine/generate";
import { createCandidateId } from "@/lib/engine/random";
import type { Candidate, GenerationParams } from "@/lib/types";

function toCandidates(handles: string[], mode: GenerationParams["mode"]): Candidate[] {
  const seen = new Set<string>();
  const results: Candidate[] = [];

  for (const raw of handles) {
    const normalized = raw.toLowerCase();
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    results.push({
      id: createCandidateId(),
      handle: raw,
      normalized,
      mode,
    });
  }

  return results;
}

export function useGenerateCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const generationIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    workerRef.current = new Worker(
      new URL("../workers/generate.worker.ts", import.meta.url),
    );

    const worker = workerRef.current;

    worker.onmessage = (event: MessageEvent<{ candidates: Candidate[] }>) => {
      if (generationIdRef.current === 0) {
        return;
      }
      setCandidates(event.data.candidates);
      setIsGenerating(false);
      generationIdRef.current = 0;
    };

    worker.onerror = () => {
      if (generationIdRef.current === 0) {
        return;
      }
      setError("Generation worker failed");
      setIsGenerating(false);
      generationIdRef.current = 0;
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const cancelGenerate = useCallback(() => {
    generationIdRef.current = 0;
    setIsGenerating(false);
  }, []);

  const generate = useCallback((params: GenerationParams) => {
    setError(null);
    setCandidates([]);
    generationIdRef.current += 1;
    setIsGenerating(true);

    if (workerRef.current) {
      workerRef.current.postMessage({ params });
      return;
    }

    try {
      const batch = generateBatch(params);
      setCandidates(batch);
    } catch {
      setError("Generation failed");
    } finally {
      setIsGenerating(false);
      generationIdRef.current = 0;
    }
  }, []);

  const setAiCandidates = useCallback(
    (handles: string[], mode?: GenerationParams["mode"]) => {
      setError(null);
      setCandidates(toCandidates(handles, mode ?? "phonetic"));
    },
    [],
  );

  const appendAiCandidates = useCallback(
    (handles: string[], mode?: GenerationParams["mode"]) => {
      setError(null);
      const resolvedMode = mode ?? "phonetic";
      setCandidates((prev) => {
        const existing = new Set(prev.map((c) => c.normalized));
        const incoming = toCandidates(handles, resolvedMode).filter(
          (c) => !existing.has(c.normalized),
        );
        return [...incoming, ...prev];
      });
    },
    [],
  );

  return {
    candidates,
    isGenerating,
    error,
    generate,
    cancelGenerate,
    setAiCandidates,
    appendAiCandidates,
  };
}
