"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Shuffle } from "lucide-react";
import type { GenerationParams } from "@/lib/types";
import {
  buildPresetShuffleFrames,
  describeConfiguration,
  mergeToFullParams,
  pickUniqueRandomConfiguration,
  type ConfigurationSummary,
} from "@/lib/randomize-config";

const SHUFFLE_FRAME_MS = 95;
const LOCK_IN_MS = 350;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type RandomizeMatrixButtonProps = {
  onApplyConfig: (params: GenerationParams) => void;
  onGenerate: (params: GenerationParams) => void;
  onScrollToOutput?: () => void;
  onRandomizingChange?: (active: boolean) => void;
  onShufflePresetChange?: (presetId: string | null) => void;
};

export function RandomizeMatrixButton({
  onApplyConfig,
  onGenerate,
  onScrollToOutput,
  onRandomizingChange,
  onShufflePresetChange,
}: RandomizeMatrixButtonProps) {
  const [phase, setPhase] = useState<"idle" | "shuffling" | "locked">("idle");
  const [tickerLabel, setTickerLabel] = useState<string | null>(null);
  const [shufflePresetId, setShufflePresetId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ConfigurationSummary | null>(null);
  const [poolNote, setPoolNote] = useState<string | null>(null);
  const runningRef = useRef(false);

  const setRandomizing = useCallback(
    (active: boolean) => {
      onRandomizingChange?.(active);
    },
    [onRandomizingChange],
  );

  const handleRandomize = async () => {
    if (runningRef.current) {
      return;
    }
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
        setShufflePresetId(preset.id);
        onShufflePresetChange?.(preset.id);
        setTickerLabel(preset.label);
        onApplyConfig(mergeToFullParams(preset.patch));
        await wait(SHUFFLE_FRAME_MS);
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

      await wait(LOCK_IN_MS);

      onScrollToOutput?.();
      onGenerate(finalParams);
    } finally {
      setPhase("idle");
      setShufflePresetId(null);
      onShufflePresetChange?.(null);
      setRandomizing(false);
      runningRef.current = false;
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
      <button
        type="button"
        onClick={handleRandomize}
        disabled={isAnimating}
        aria-busy={isAnimating}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dr-purple-light/40 bg-dr-purple/10 px-4 py-3 text-sm font-semibold text-dr-purple-light transition hover:border-dr-purple-light/70 hover:bg-dr-purple/20 disabled:cursor-wait disabled:opacity-80"
      >
        {isAnimating ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Shuffle className="h-4 w-4" aria-hidden />
        )}
        {phase === "shuffling"
          ? "Randomizing…"
          : phase === "locked"
            ? "Generating handles…"
            : "Randomize matrix"}
      </button>

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
            {tickerLabel ?? "—"}
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
