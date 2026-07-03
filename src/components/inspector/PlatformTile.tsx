"use client";

import type { PlatformCheckResult } from "@/lib/checker/report-types";
import type { CheckStatus } from "@/lib/types";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { Check, ExternalLink, HelpCircle, Loader2, X } from "lucide-react";

const TILE_GLOW: Record<CheckStatus, string> = {
  idle: "check-tile-idle",
  loading: "check-tile-loading",
  available: "check-tile-available",
  taken: "check-tile-taken",
  unknown: "check-tile-unknown",
  verify: "check-tile-unknown",
  error: "check-tile-taken",
};

const STATUS_KEY: Record<CheckStatus, "statusPending" | "statusFree" | "statusTaken" | "statusUnknown"> = {
  idle: "statusPending",
  loading: "statusPending",
  available: "statusFree",
  taken: "statusTaken",
  unknown: "statusUnknown",
  verify: "statusUnknown",
  error: "statusTaken",
};

type PlatformTileProps = {
  platform: PlatformCheckResult;
  index?: number;
};

export function PlatformTile({ platform, index = 0 }: PlatformTileProps) {
  const { t } = useAppPreferences();
  const glow = TILE_GLOW[platform.status] ?? TILE_GLOW.idle;
  const isLive = platform.status === "loading";
  const statusLabel =
    platform.status === "loading" ? "…" : t(STATUS_KEY[platform.status]);

  return (
    <article
      className={`check-platform-tile ${glow} ${isLive ? "check-tile-pulse" : ""}`}
      style={{ animationDelay: `${Math.min(index, 24) * 30}ms` }}
    >
      <a
        href={platform.profileUrl ?? platform.visitUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="check-tile-link group flex h-full flex-col items-center p-3"
        aria-label={`${platform.name}: ${statusLabel}`}
      >
        <div className="check-tile-icon-wrap mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-black/30">
          <PlatformIcon
            slug={platform.iconSlug}
            color={platform.color}
            abbr={platform.abbr}
            name={platform.name}
            size={26}
          />
        </div>

        <p className="w-full truncate text-center text-[11px] font-semibold text-zinc-100">
          {platform.name}
        </p>

        <span className={`check-tile-status mt-1.5 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide status-${platform.status}`}>
          {platform.status === "loading" ? (
            <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
          ) : platform.status === "available" ? (
            <Check className="h-2.5 w-2.5" aria-hidden />
          ) : platform.status === "taken" || platform.status === "error" ? (
            <X className="h-2.5 w-2.5" aria-hidden />
          ) : (
            <HelpCircle className="h-2.5 w-2.5" aria-hidden />
          )}
          {statusLabel}
        </span>

        {platform.latencyMs !== undefined ? (
          <span className="mt-1 text-[9px] tabular-nums text-dr-muted opacity-0 transition group-hover:opacity-100">
            {platform.latencyMs}ms
          </span>
        ) : null}

        <ExternalLink
          className="absolute right-2 top-2 h-3 w-3 text-cyan-400/0 transition group-hover:text-cyan-400/70"
          aria-hidden
        />
      </a>
    </article>
  );
}
