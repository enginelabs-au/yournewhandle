"use client";

import { useCallback, useRef, useState } from "react";
import type { GenerationParams } from "@/lib/types";
import {
  applyLengthConstraint,
  buildPresetShuffleFrames,
  describeConfiguration,
  mergeToFullParams,
  pickUniqueRandomConfiguration,
  type ConfigurationSummary,
  type LengthConstraint,
} from "@/lib/randomize-config";

const SHUFFLE_FRAME_MS = 95;
const LOCK_IN_MS = 350;

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

type UseRandomizeGenerateArgs = {
  onApplyConfig: (params: GenerationParams) => void;
  onGenerate: (params: GenerationParams) => void;
  onScrollToOutput?: () => void;
  onRandomizingChange?: (active: boolean) => void;
  onShufflePresetChange?: (presetId: string | null) => void;
  /** When set and lock enabled, Generate & Check keeps this length range while randomizing other settings. */
  getLengthConstraint?: () => LengthConstraint | undefined;
};

export function useRandomizeGenerate({
  onApplyConfig,
  onGenerate,
  onScrollToOutput,
  onRandomizingChange,
  onShufflePresetChange,
  getLengthConstraint,
}: UseRandomizeGenerateArgs) {
  const [phase, setPhase] = useState<"idle" | "shuffling" | "locked">("idle");
  const [tickerLabel, setTickerLabel] = useState<string | null>(null);
  const [summary, setSummary] = useState<ConfigurationSummary | null>(null);
  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancelRandomize = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    runningRef.current = false;
    setPhase("idle");
    onShufflePresetChange?.(null);
    onRandomizingChange?.(false);
  }, [onRandomizingChange, onShufflePresetChange]);

  const runRandomizeAndGenerate = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    runningRef.current = true;
    onRandomizingChange?.(true);
    setPhase("shuffling");
    setSummary(null);

    const lengthConstraint = getLengthConstraint?.();
    const withLength = (params: GenerationParams) =>
      lengthConstraint
        ? applyLengthConstraint(params, lengthConstraint)
        : params;

    const { params: finalParams } = pickUniqueRandomConfiguration(
      lengthConstraint ? { lengthConstraint } : undefined,
    );
    const finalSummary = describeConfiguration(finalParams);
    const frames = buildPresetShuffleFrames(12);

    try {
      for (const preset of frames) {
        if (controller.signal.aborted) {
          return;
        }
        onShufflePresetChange?.(preset.id);
        setTickerLabel(preset.label);
        onApplyConfig(withLength(mergeToFullParams(preset.patch)));
        await wait(SHUFFLE_FRAME_MS, controller.signal);
      }

      if (controller.signal.aborted) {
        return;
      }

      setPhase("locked");
      setTickerLabel("Locking in…");
      onShufflePresetChange?.(null);
      onApplyConfig(finalParams);
      setSummary(finalSummary);
      setTickerLabel(finalSummary.headline);

      await wait(LOCK_IN_MS, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      onScrollToOutput?.();
      onGenerate(finalParams);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      throw error;
    } finally {
      setPhase("idle");
      onShufflePresetChange?.(null);
      onRandomizingChange?.(false);
      runningRef.current = false;
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [
    getLengthConstraint,
    onApplyConfig,
    onGenerate,
    onRandomizingChange,
    onScrollToOutput,
    onShufflePresetChange,
  ]);

  return {
    phase,
    tickerLabel,
    summary,
    isRandomizing: phase !== "idle",
    runRandomizeAndGenerate,
    cancelRandomize,
  };
}
