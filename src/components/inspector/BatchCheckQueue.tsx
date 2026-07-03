"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type { BatchCheckProgress, BatchPlatformResults } from "@/hooks/useBatchAvailability";
import type { Candidate, CheckStatus } from "@/lib/types";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { CheckProgressBar } from "@/components/inspector/CheckProgressBar";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import {
  CATEGORY_DISPLAY_ORDER,
  type CategoryStatusSummary,
} from "@/lib/checker/category-groups";
import {
  POPULAR_PLATFORMS,
  type PlatformDefinition,
} from "@/lib/platforms-registry";
import type { PlatformCategory } from "@/lib/platforms-registry.types";

type BatchCheckQueueProps = {
  candidates: Candidate[];
  platformResults: BatchPlatformResults;
  progress: BatchCheckProgress | null;
  isRunning: boolean;
  onStop: () => void;
};

type CategoryGroup = {
  category: PlatformCategory;
  platforms: PlatformDefinition[];
};

function groupPopularPlatformsByCategory(): CategoryGroup[] {
  const byCategory = new Map<PlatformCategory, PlatformDefinition[]>();

  for (const platform of POPULAR_PLATFORMS) {
    const list = byCategory.get(platform.category) ?? [];
    list.push(platform);
    byCategory.set(platform.category, list);
  }

  const ordered: CategoryGroup[] = [];

  for (const category of CATEGORY_DISPLAY_ORDER) {
    if (category === "Popular") {
      continue;
    }
    const platforms = byCategory.get(category);
    if (platforms?.length) {
      ordered.push({ category, platforms });
      byCategory.delete(category);
    }
  }

  for (const [category, platforms] of byCategory) {
    if (platforms.length) {
      ordered.push({ category, platforms });
    }
  }

  return ordered;
}

function handleStatusClass(status: CheckStatus): string {
  if (status === "available") {
    return "text-emerald-400";
  }
  if (status === "taken") {
    return "text-rose-400";
  }
  return "text-amber-400";
}

function statusToSummaryKey(status: CheckStatus): keyof CategoryStatusSummary {
  if (status === "available") {
    return "available";
  }
  if (status === "taken") {
    return "taken";
  }
  if (status === "loading") {
    return "loading";
  }
  return "unknown";
}

function summarizeBatchCategory(
  platforms: PlatformDefinition[],
  platformResults: BatchPlatformResults,
  candidateIds: Set<string>,
  isRunning: boolean,
): CategoryStatusSummary {
  const summary: CategoryStatusSummary = {
    available: 0,
    taken: 0,
    loading: 0,
    unknown: 0,
  };

  for (const platform of platforms) {
    const resultsForPlatform = platformResults[platform.id] ?? {};
    const statuses = Object.entries(resultsForPlatform)
      .filter(([candidateId]) => candidateIds.has(candidateId))
      .map(([, status]) => status);

    if (statuses.length === 0) {
      if (isRunning) {
        summary.loading += 1;
      } else {
        summary.unknown += 1;
      }
      continue;
    }

    for (const status of statuses) {
      summary[statusToSummaryKey(status)] += 1;
    }
  }

  return summary;
}

function BatchCategoryPills({ summary }: { summary: CategoryStatusSummary }) {
  const pills: { label: string; value: number; className: string }[] = [];

  if (summary.available > 0) {
    pills.push({
      label: "available",
      value: summary.available,
      className: "check-category-pill-free",
    });
  }
  if (summary.taken > 0) {
    pills.push({
      label: "taken",
      value: summary.taken,
      className: "check-category-pill-taken",
    });
  }
  if (summary.loading > 0) {
    pills.push({
      label: "checking",
      value: summary.loading,
      className: "check-category-pill-loading",
    });
  }
  if (summary.unknown > 0) {
    pills.push({
      label: "unknown",
      value: summary.unknown,
      className: "check-category-pill-other",
    });
  }

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className="check-category-pills flex flex-wrap gap-1">
      {pills.map((pill) => (
        <span key={pill.label} className={`check-category-pill ${pill.className}`}>
          {pill.value} {pill.label}
        </span>
      ))}
    </div>
  );
}

function BatchCategorySection({
  category,
  platforms,
  candidates,
  platformResults,
  isRunning,
  defaultOpen = false,
}: {
  category: PlatformCategory;
  platforms: PlatformDefinition[];
  candidates: Candidate[];
  platformResults: BatchPlatformResults;
  isRunning: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const summary = summarizeBatchCategory(
    platforms,
    platformResults,
    candidateIds,
    isRunning,
  );
  const hasLiveChecks = summary.loading > 0;

  return (
    <section className="check-category-section">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="check-category-header"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="check-category-title">{category}</span>
            <span className="check-category-count">{platforms.length}</span>
            {hasLiveChecks ? (
              <span className="check-category-live-dot" aria-hidden />
            ) : null}
          </div>
          <BatchCategoryPills summary={summary} />
        </div>
        <ChevronDown
          className={`check-category-chevron ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="check-category-body space-y-2">
          {platforms.map((platform) => {
            const resultsForPlatform = platformResults[platform.id] ?? {};
            const resolvedEntries = Object.entries(resultsForPlatform).filter(
              ([candidateId]) => candidateById.has(candidateId),
            );

            return (
              <article
                key={platform.id}
                className="batch-platform-row rounded-lg border border-cyan-400/10 bg-black/20 px-2.5 py-2"
              >
                <div className="flex items-center gap-2">
                  <PlatformIcon
                    slug={platform.iconSlug}
                    color={platform.color}
                    abbr={platform.abbr}
                    name={platform.name}
                    size={18}
                  />
                  <span className="truncate text-xs font-medium text-zinc-200">
                    {platform.name}
                  </span>
                  {isRunning && resolvedEntries.length === 0 ? (
                    <Loader2
                      className="ml-auto h-3 w-3 shrink-0 animate-spin text-cyan-300/70"
                      aria-hidden
                    />
                  ) : null}
                </div>

                {resolvedEntries.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 pl-6">
                    {resolvedEntries.map(([candidateId, status]) => {
                      const candidate = candidateById.get(candidateId);
                      if (!candidate) {
                        return null;
                      }
                      return (
                        <span
                          key={candidateId}
                          className={`font-mono text-[11px] font-medium ${handleStatusClass(status)}`}
                        >
                          {candidate.normalized}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export function BatchCheckQueue({
  candidates,
  platformResults,
  progress,
  isRunning,
  onStop,
}: BatchCheckQueueProps) {
  const { t } = useAppPreferences();
  const categoryGroups = groupPopularPlatformsByCategory();

  if (!candidates.length) {
    return null;
  }

  return (
    <section
      className="batch-check-queue flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-cyan-400/25 bg-cyan-950/25 p-3"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-cyan-200/90">
          {t("batchCheckTitle")}
        </h3>
        {progress ? (
          <span className="text-[10px] tabular-nums text-cyan-200/70">
            {t("checkingHandles", {
              current: progress.completedHandles,
              total: progress.totalHandles,
            })}
          </span>
        ) : null}
      </div>

      <p className="text-[10px] leading-relaxed text-cyan-200/55">
        {t("batchCheckScope")}
      </p>

      {isRunning && progress ? (
        <CheckProgressBar
          current={progress.completedPlatforms}
          total={progress.totalPlatforms}
          startedAt={progress.startedAt}
          label={t("checkingBatch")}
          onStop={onStop}
        />
      ) : null}

      <div className="batch-check-handles rounded-lg border border-cyan-400/15 bg-black/25 px-3 py-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-200/60">
          {t("batchHandlesLabel")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {candidates.map((candidate) => (
            <span
              key={candidate.id}
              className="rounded-md bg-cyan-950/50 px-2 py-0.5 font-mono text-[11px] text-zinc-200"
            >
              @{candidate.normalized}
            </span>
          ))}
        </div>
      </div>

      <div className="batch-platform-matrix check-category-stack min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {categoryGroups.map((group, index) => (
          <BatchCategorySection
            key={group.category}
            category={group.category}
            platforms={group.platforms}
            candidates={candidates}
            platformResults={platformResults}
            isRunning={isRunning}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
