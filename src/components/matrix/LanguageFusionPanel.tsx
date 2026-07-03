"use client";

import {
  LANGUAGE_IDS,
  type GenerationParams,
  type LanguageId,
} from "@/lib/types";
import {
  LANGUAGE_LABELS,
  languageWeightTotal,
} from "@/lib/matrix-validation";
import { SliderField } from "@/components/ui/matrix-controls";

type LanguageFusionPanelProps = {
  params: GenerationParams;
  onChange: (patch: Partial<GenerationParams>) => void;
  hidden?: boolean;
};

function redistributeWeights(
  weights: Record<LanguageId, number>,
  changedId: LanguageId,
  nextValue: number,
): Record<LanguageId, number> {
  const clamped = Math.max(0, Math.min(100, nextValue));
  const others = LANGUAGE_IDS.filter((id) => id !== changedId);
  const remaining = 100 - clamped;
  const otherTotal = others.reduce((sum, id) => sum + weights[id], 0);

  const next = { ...weights, [changedId]: clamped };

  if (others.length === 0) {
    return next;
  }

  if (otherTotal <= 0) {
    const share = Math.floor(remaining / others.length);
    others.forEach((id, index) => {
      next[id] =
        index === others.length - 1
          ? remaining - share * (others.length - 1)
          : share;
    });
    return next;
  }

  let allocated = 0;
  others.forEach((id, index) => {
    if (index === others.length - 1) {
      next[id] = remaining - allocated;
    } else {
      const value = Math.round((weights[id] / otherTotal) * remaining);
      next[id] = value;
      allocated += value;
    }
  });

  return next;
}

function toggleLanguage(
  weights: Record<LanguageId, number>,
  id: LanguageId,
  enabled: boolean,
): Record<LanguageId, number> {
  if (enabled) {
    if (weights[id] > 0) {
      return weights;
    }
    const active = LANGUAGE_IDS.filter((lang) => weights[lang] > 0);
    if (active.length === 0) {
      return { ...weights, [id]: 100 };
    }
    const share = Math.floor(100 / (active.length + 1));
    const next = { ...weights, [id]: share };
    let allocated = share;
    active.forEach((lang, index) => {
      const value =
        index === active.length - 1
          ? 100 - allocated - share
          : share;
      next[lang] = value;
      allocated += value;
    });
    return next;
  }

  const removedWeight = weights[id];
  const next = { ...weights, [id]: 0 };
  const active = LANGUAGE_IDS.filter((lang) => lang !== id && next[lang] > 0);
  if (active.length === 0) {
    next.english = 100;
    return next;
  }

  let allocated = 0;
  active.forEach((lang, index) => {
    if (index === active.length - 1) {
      next[lang] = next[lang] + (removedWeight - allocated);
    } else {
      const bonus = Math.round(
        (next[lang] / (100 - removedWeight)) * removedWeight,
      );
      next[lang] = next[lang] + bonus;
      allocated += bonus;
    }
  });

  return next;
}

export function LanguageFusionPanel({
  params,
  onChange,
  hidden,
}: LanguageFusionPanelProps) {
  if (hidden) {
    return null;
  }

  const total = languageWeightTotal(params.languageWeights);

  return (
    <div className="space-y-3 rounded-lg border border-dr-border bg-dr-panel-2/40 p-3">
        <p className="text-xs text-zinc-500">
          Enable languages and balance weights (must sum to 100%).
        </p>

        {LANGUAGE_IDS.map((id) => {
          const enabled = params.languageWeights[id] > 0;
          return (
            <div key={id} className="space-y-2 border-t border-border-subtle/40 pt-3 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => {
                      onChange({
                        languageWeights: toggleLanguage(
                          params.languageWeights,
                          id,
                          event.target.checked,
                        ),
                      });
                    }}
                    className="rounded border-border-subtle bg-base accent-accent-cyan"
                  />
                  {LANGUAGE_LABELS[id]}
                </label>
                <span className="text-xs text-zinc-500">
                  {params.languageWeights[id]}%
                </span>
              </div>
              {enabled ? (
                <SliderField
                  id={`lang-${id}`}
                  label={`${LANGUAGE_LABELS[id]} weight`}
                  min={0}
                  max={100}
                  value={params.languageWeights[id]}
                  onChange={(value) => {
                    onChange({
                      languageWeights: redistributeWeights(
                        params.languageWeights,
                        id,
                        value,
                      ),
                    });
                  }}
                />
              ) : null}
            </div>
          );
        })}

        <p
          className={`text-xs ${
            total === 100 ? "text-zinc-500" : "text-status-unknown"
          }`}
        >
          Total: {total}%
        </p>
    </div>
  );
}
