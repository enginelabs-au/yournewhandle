"use client";

import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { CheckStatus } from "@/lib/types";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Check, ExternalLink, HelpCircle, Loader2, X } from "lucide-react";

const STATUS_STYLES: Record<
  CheckStatus,
  { label: string; bar: string; text: string; bg: string }
> = {
  idle: { label: "Pending", bar: "bg-zinc-600", text: "text-zinc-400", bg: "bg-zinc-800/40" },
  loading: { label: "Checking", bar: "bg-sky-400", text: "text-sky-300", bg: "bg-sky-950/40" },
  available: { label: "Available", bar: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-950/35" },
  taken: { label: "Taken", bar: "bg-rose-400", text: "text-rose-300", bg: "bg-rose-950/35" },
  unknown: { label: "Unknown", bar: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-950/35" },
  verify: { label: "Unknown", bar: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-950/35" },
  error: { label: "Taken", bar: "bg-rose-400", text: "text-rose-300", bg: "bg-rose-950/35" },
};

type PlatformListRowProps = {
  platform: PlatformCheckResult;
  index?: number;
};

export function PlatformListRow({ platform, index = 0 }: PlatformListRowProps) {
  const style = STATUS_STYLES[platform.status] ?? STATUS_STYLES.idle;
  const isLive = platform.status === "loading";

  return (
    <article
      className={`check-list-row ${style.bg} ${isLive ? "check-list-row-live" : ""}`}
      style={{ animationDelay: `${Math.min(index, 20) * 35}ms` }}
    >
      <div className={`check-list-bar ${style.bar}`} aria-hidden />

      <div className="check-list-icon shrink-0">
        <PlatformIcon
          slug={platform.iconSlug}
          color={platform.color}
          abbr={platform.abbr}
          name={platform.name}
          size={32}
          className="rounded-lg"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-zinc-100">{platform.name}</p>
          <span className={`inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${style.text}`}>
            {platform.status === "loading" ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            ) : platform.status === "available" ? (
              <Check className="h-3 w-3" aria-hidden />
            ) : platform.status === "taken" || platform.status === "error" ? (
              <X className="h-3 w-3" aria-hidden />
            ) : (
              <HelpCircle className="h-3 w-3" aria-hidden />
            )}
            {style.label}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-dr-muted">
          <span>{platform.category}</span>
          <span className="tabular-nums">
            {platform.latencyMs !== undefined ? `${platform.latencyMs}ms` : "—"}
          </span>
        </div>
      </div>

      <a
        href={platform.profileUrl ?? platform.visitUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="check-list-link shrink-0"
        aria-label={`View ${platform.name} profile`}
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
    </article>
  );
}
