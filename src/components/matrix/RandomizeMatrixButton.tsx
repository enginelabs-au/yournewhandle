"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Shuffle, Square } from "lucide-react";
import type { GenerationParams } from "@/lib/types";
import {
  buildPresetShuffleFrames,
  describeConfiguration,
  mergeToFullParams,
  pickUniqueRandomConfiguration,
  type ConfigurationSummary,
} from "@/lib/randomize-config";
import { useAppPreferences } from "@/context/AppPreferencesProvider";

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

type RandomizeMatrixButtonProps = {
  onApplyConfig: (params: GenerationParams) => void;
  onGenerate: (params: GenerationParams) => void;
  onScrollToOutput?: () => void;
  onRandomizingChange?: (active: boolean) => void;
  onShufflePresetChange?: (presetId: string | null) => void;
  onStop?: () => void;
};

export function RandomizeMatrixButton({
  onApplyConfig,
  onGenerate,
  onScrollToOutput,
  onRandomizingChange,
  onShufflePresetChange,
  onStop,
}: RandomizeMatrixButtonProps) {
  const { t } = useAppPreferences();
  const [phase, setPhase] = useState<"idle" | "shuffling" | "locked">("idle");
  const [tickerLabel, setTickerLabel] = useState<string | null>(null);
  const [shufflePresetId, setShufflePresetId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ConfigurationSummary | null>(null);
  const [poolNote, setPoolNote] = useState<string | null>(null);
  const runningRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const setRandomizing = useCallback(
    (active: boolean) => {
      onRandomizingChange?.(active);
    },
    [onRandomizingChange],
  );

  const handleStop = () => {
    abortRef.current?.abort();
    onStop?.();
  };

  const handleRandomize = async () => {
    if (runningRef.current) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    runningRef.current = true;
    setRandomizing(true);
    setPhase("shuffling");
    setSummary(null);
    setPoolNote(null);

    const { params: finalParams, poolReset } = pickUniqueRandomConfiguration();
    const finalSummary = describeConfiguration(finalParams);
    const frames = buildPresetShuffleFrames(12);

    try {
      for (const preset of frames) {
        if (controller.signal.aborted) {
          return;
        }
        setShufflePresetId(preset.id);
        onShufflePresetChange?.(preset.id);
        setTickerLabel(preset.label);
        onApplyConfig(mergeToFullParams(preset.patch));
        await wait(SHUFFLE_FRAME_MS, controller.signal);
      }

      if (controller.signal.aborted) {
        return;
      }

      setPhase("locked");
      setTickerLabel("Locking in…");
      setShufflePresetId(null);
      onShufflePresetChange?.(null);
      onApplyConfig(finalParams);
      setSummary(finalSummary);
      setTickerLabel(finalSummary.headline);
      setPoolNote(
        poolReset
          ? "Explored every unique combo this session — pool refreshed."
          : null,
      );

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
      setShufflePresetId(null);
      onShufflePresetChange?.(null);
      setRandomizing(false);
      runningRef.current = false;
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  const isAnimating = phase !== "idle";

  return (
    <div
      className={`randomize-matrix-panel rounded-lg border p-3 transition ${
        isAnimating
          ? "randomize-matrix-panel-active border-dr-purple-light/50 bg-dr-purple/15"
          : "border-dr-border/60 bg-dr-panel-2/30"
      }`}
      data-shuffle-preset={shufflePresetId ?? undefined}
    >
      {isAnimating ? (
        <button
          type="button"
          onClick={handleStop}
          className="dr-btn-stop flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
        >
          <Square className="h-4 w-4 fill-current" aria-hidden />
          {t("stop")}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleRandomize}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dr-purple-light/40 bg-dr-purple/10 px-4 py-3 text-sm font-semibold text-dr-purple-light transition hover:border-dr-purple-light/70 hover:bg-dr-purple/20"
        >
          <Shuffle className="h-4 w-4" aria-hidden />
          Randomize matrix
        </button>
      )}

      {isAnimating || summary ? (
        <div
          className="randomize-matrix-ticker mt-3 rounded-lg border border-dr-purple-light/25 bg-dr-panel/60 px-3 py-2.5"
          aria-live="polite"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-dr-muted">
            {phase === "shuffling" ? "Scanning presets" : "Selected configuration"}
          </p>
          <p
            key={tickerLabel ?? "idle"}
            className={`mt-1 text-sm font-semibold text-dr-purple-light ${
              phase === "shuffling" ? "randomize-ticker-flash" : ""
            }`}
          >
            {isAnimating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {tickerLabel ?? "—"}
              </span>
            ) : (
              (tickerLabel ?? "—")
            )}
          </p>
          {summary ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {summary.chips.map((chip) => (
                <span
                  key={chip}
                  className="randomize-chip rounded-full border border-dr-purple-light/30 bg-dr-purple/10 px-2 py-0.5 text-[10px] font-medium text-zinc-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-center text-[11px] text-dr-muted">
          {poolNote ??
            "Shuffles presets & settings, then generates a fresh batch — never repeats in this session."}
        </p>
      )}
    </div>
  );
}
