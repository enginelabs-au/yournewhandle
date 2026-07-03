"use client";

import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { CheckStatus } from "@/lib/types";
import { Check, ExternalLink, HelpCircle, Loader2, X } from "lucide-react";

const CARD_BG: Record<CheckStatus, string> = {
  idle: "dr-card-idle",
  loading: "dr-card-loading",
  available: "dr-card-available",
  taken: "dr-card-taken",
  unknown: "dr-card-unknown",
  verify: "dr-card-unknown",
  error: "dr-card-taken",
};

const STATUS_LABEL: Record<CheckStatus, { label: string; className: string }> = {
  idle: { label: "Pending", className: "dr-badge-muted" },
  loading: { label: "Checking", className: "dr-badge-muted" },
  available: { label: "Available", className: "dr-badge-available" },
  taken: { label: "Taken", className: "dr-badge-taken" },
  unknown: { label: "Unknown", className: "dr-badge-unknown" },
  verify: { label: "Verify", className: "dr-badge-unknown" },
  error: { label: "Error", className: "dr-badge-taken" },
};

type DnsPlatformCardProps = {
  platform: PlatformCheckResult;
  index?: number;
};

export function DnsPlatformCard({ platform, index = 0 }: DnsPlatformCardProps) {
  const bg = CARD_BG[platform.status] ?? "dr-card-idle";
  const statusStyle = STATUS_LABEL[platform.status];
  const isLive = platform.status === "loading";

  return (
    <article
      className={`dr-platform-card platform-card-enter ${bg} flex flex-col rounded-xl p-4 ${
        isLive ? "platform-card-pulse" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: platform.color }}
          >
            {platform.abbr}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">
              {platform.name}
            </p>
            <p className="text-[11px] text-dr-muted">
              {platform.category}
              {platform.latencyMs !== undefined ? (
                <span className="ml-1 opacity-70">{platform.latencyMs}ms</span>
              ) : null}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${statusStyle.className}`}
        >
          {platform.status === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : platform.status === "available" ? (
            <Check className="h-3 w-3" aria-hidden />
          ) : platform.status === "taken" || platform.status === "error" ? (
            <X className="h-3 w-3" aria-hidden />
          ) : (
            <HelpCircle className="h-3 w-3" aria-hidden />
          )}
          {statusStyle.label}
        </span>
      </div>

      {platform.message ? (
        <p className="mt-2 text-[11px] leading-relaxed text-dr-muted/90">
          {platform.message}
        </p>
      ) : null}

      <div className="mt-auto pt-3">
        <a
          href={platform.profileUrl ?? platform.visitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-dr-blue-light transition hover:translate-x-0.5 hover:underline"
        >
          View Profile
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>
    </article>
  );
}
