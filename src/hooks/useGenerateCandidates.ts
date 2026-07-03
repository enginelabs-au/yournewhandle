"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateBatch } from "@/lib/engine/generate";
import type { Candidate, GenerationParams } from "@/lib/types";

export function useGenerateCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    workerRef.current = new Worker(
      new URL("../workers/generate.worker.ts", import.meta.url),
    );

    const worker = workerRef.current;

    worker.onmessage = (event: MessageEvent<{ candidates: Candidate[] }>) => {
      setCandidates(event.data.candidates);
      setIsGenerating(false);
    };

    worker.onerror = () => {
      setError("Generation worker failed");
      setIsGenerating(false);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const generate = useCallback((params: GenerationParams) => {
    setError(null);
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
    }
  }, []);

  return { candidates, isGenerating, error, generate };
}
