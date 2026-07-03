"use client";

import type { GenerationParams } from "@/lib/types";
import { LANGUAGE_IDS } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/matrix-validation";
import { MatrixSection } from "@/components/ui/matrix-controls";

type EngineSummaryPanelProps = {
  params: GenerationParams;
};

export function EngineSummaryPanel({ params }: EngineSummaryPanelProps) {
  const activeLanguages = LANGUAGE_IDS.filter(
    (id) => params.languageWeights[id] > 0,
  );
  const dictChars = Math.floor(params.maxLen * (params.dictionaryWeight / 100));
  const phoneticChars = params.maxLen - dictChars;
  const isTicker = params.minLen <= 4 && params.maxLen <= 4;

  return (
    <MatrixSection title="Engine preview">
      <div className="space-y-2 rounded-lg border border-dr-border bg-dr-panel-2/50 p-3 font-mono text-[11px] leading-relaxed text-dr-muted">
        <Row label="Mode" value={params.mode} />
        <Row
          label="Length"
          value={`${params.minLen}–${params.maxLen} chars`}
        />
        {params.mode === "phonetic" ? (
          <>
            <Row
              label="Syllables"
              value={`${params.syllableCount.min}–${params.syllableCount.max}`}
            />
            <Row
              label="Structure"
              value={params.compound ? "Compound (2× CVC)" : "CVC syllables"}
            />
            <Row
              label="Languages"
              value={
                activeLanguages.length
                  ? activeLanguages
                      .map(
                        (id) =>
                          `${LANGUAGE_LABELS[id]} ${params.languageWeights[id]}%`,
                      )
                      .join(" · ")
                  : "None"
              }
            />
            {params.dictionaryWeight > 0 && params.dictionaryWeight < 100 ? (
              <Row
                label="Hybrid split"
                value={`~${dictChars} dict + ~${phoneticChars} phonetic @ ${params.maxLen} chars`}
              />
            ) : null}
          </>
        ) : (
          <>
            <Row label="Dictionary" value={`${params.dictionaryWeight}%`} />
            <Row
              label="Phrase entropy"
              value={`${params.entropy}% · ${params.entropy > 50 ? "3 words" : "2 words"}`}
            />
          </>
        )}
        {params.prefix ? <Row label="Prefix lock" value={params.prefix} /> : null}
        {params.suffix ? <Row label="Suffix lock" value={params.suffix} /> : null}
        <Row label="Casing" value={params.casing} />
        <Row label="Batch" value={`${params.batchSize} handles`} />
        {isTicker ? (
          <p className="border-t border-dr-border pt-2 text-dr-amber">
            Ticker mode — optimized for short 3–4 char handles
          </p>
        ) : null}
      </div>
    </MatrixSection>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-zinc-500">{label}</span>
      <span className="text-right text-zinc-300">{value}</span>
    </div>
  );
}
