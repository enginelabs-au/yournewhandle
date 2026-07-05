"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlatformCheckResult } from "@/lib/checker/report-types";
import { PlatformTile } from "@/components/inspector/PlatformTile";
import {
  categoryCollapsedSubtitle,
  summarizeCategoryStatuses,
  type CategoryStatusSummary,
} from "@/lib/checker/category-groups";
import type { PlatformCategory } from "@/lib/platforms-registry.types";

type CheckerCategorySectionProps = {
  category: PlatformCategory;
  platforms: PlatformCheckResult[];
  defaultOpen?: boolean;
  forceOpen?: boolean;
};

function StatusPills({ summary }: { summary: CategoryStatusSummary }) {
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

export function CheckerCategorySection({
  category,
  platforms,
  defaultOpen = false,
  forceOpen = false,
}: CheckerCategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen || forceOpen);
  const isOpen = forceOpen || open;
  const summary = summarizeCategoryStatuses(platforms);
  const hasLiveChecks = summary.loading > 0;
  const hasCheckResults = platforms.some(
    (platform) =>
      platform.status !== "idle" &&
      platform.status !== "loading",
  );

  return (
    <section className="check-category-section">
      <button
        type="button"
        onClick={() => {
          if (!forceOpen) {
            setOpen((value) => !value);
          }
        }}
        className={`check-category-header ${forceOpen ? "check-category-header-static" : ""}`}
        aria-expanded={isOpen}
        disabled={forceOpen}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="check-category-title">{category}</span>
            <span className="check-category-count">{platforms.length}</span>
            {hasLiveChecks ? (
              <span className="check-category-live-dot" aria-hidden />
            ) : null}
          </div>

          {!hasCheckResults ? (
            <p className="check-category-subtitle truncate">
              {categoryCollapsedSubtitle(platforms)}
            </p>
          ) : (
            <StatusPills summary={summary} />
          )}
        </div>

        {!forceOpen ? (
          <ChevronDown
            className={`check-category-chevron ${isOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        ) : null}
      </button>

      {isOpen ? (
        <div className="check-category-body">
          <div className="check-tile-grid grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {platforms.map((platform, index) => (
              <PlatformTile
                key={platform.platformId}
                platform={platform}
                index={index}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
