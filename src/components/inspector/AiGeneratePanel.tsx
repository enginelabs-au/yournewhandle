"use client";

import { useCallback, useState } from "react";
import type { Candidate, GenerationParams } from "@/lib/types";
import { Sparkles, Wand2 } from "lucide-react";

type AiGeneratePanelProps = {
  params: GenerationParams;
  selectedCandidate: Candidate | null;
  onApplySuggestion: (handle: string) => void;
  onAiResults: (handles: string[]) => void;
  isGenerating: boolean;
};

export function AiGeneratePanel({
  params,
  selectedCandidate,
  onApplySuggestion,
  onAiResults,
  isGenerating,
}: AiGeneratePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 3) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch("/api/polish-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          params,
          referenceHandle: selectedCandidate?.normalized ?? null,
          count: params.batchSize,
        }),
      });

      const data = (await response.json()) as {
        suggestions?: string[];
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      const handles = data.suggestions ?? [];
      setSuggestions(handles);
      if (handles.length > 0) {
        onAiResults(handles);
      }
    } catch {
      setError("Generation failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [onAiResults, params, prompt, selectedCandidate?.normalized]);

  const busy = loading || isGenerating;
  const canSubmit = prompt.trim().length >= 3 && !busy;

  return (
    <div className="gen-polish-zone rounded-xl border border-dr-border/60 bg-dr-panel-2/30 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Wand2 className="h-3.5 w-3.5 text-dr-purple-light" aria-hidden />
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-dr-muted">
          AI handle studio
        </h3>
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-dr-muted">
        Describe the vibe you want — mood, industry, sound, length feel. Gemini
        reads your full matrix settings (languages, affixes, mood, platforms)
        and returns handles that match.
        {selectedCandidate
          ? ` Using "${selectedCandidate.handle}" as a loose reference.`
          : ""}
      </p>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="e.g. ethereal fantasy brand for a music app, soft endings, 2 syllables, feels like lumikoi or sylphora…"
        disabled={busy}
        rows={3}
        className="mb-2 w-full resize-none rounded-lg border border-dr-border bg-dr-panel px-3 py-2 text-sm text-zinc-200 placeholder:text-dr-muted/60 disabled:opacity-50"
      />

      <button
        type="button"
        onClick={generate}
        disabled={!canSubmit}
        aria-busy={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dr-purple-light/40 bg-dr-purple/15 px-3 py-2 text-sm font-semibold text-dr-purple-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Sparkles className="h-4 w-4 animate-pulse" aria-hidden />
        ) : (
          <Wand2 className="h-4 w-4" aria-hidden />
        )}
        {loading ? "Generating…" : "Generate with AI"}
      </button>

      {error ? <p className="mt-2 text-xs text-dr-red">{error}</p> : null}

      {suggestions.length > 0 ? (
        <div className="mt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-dr-muted">
            Results — tap to check availability
          </p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="rounded-md border border-dr-border bg-dr-panel px-2.5 py-1 font-mono text-xs text-zinc-200 hover:border-accent-cyan/50 hover:text-accent-cyan"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
