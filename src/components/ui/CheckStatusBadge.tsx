import type { CheckStatus } from "@/lib/types";
import {
  Check,
  HelpCircle,
  Loader2,
  X,
} from "lucide-react";

const STATUS_STYLES: Record<
  CheckStatus,
  { className: string; label: string }
> = {
  idle: { className: "text-zinc-500 border-zinc-600/60 bg-zinc-800/30", label: "Idle" },
  loading: { className: "text-zinc-400 border-zinc-600/60 bg-zinc-800/40", label: "Checking" },
  available: {
    className: "text-status-available border-status-available/50 bg-status-available/15 shadow-[0_0_8px_rgb(63_185_80_/_0.15)]",
    label: "Available",
  },
  taken: {
    className: "text-status-taken border-status-taken/50 bg-status-taken/15 shadow-[0_0_8px_rgb(248_81_73_/_0.15)]",
    label: "Taken",
  },
  unknown: {
    className: "text-status-unknown border-status-unknown/50 bg-status-unknown/15",
    label: "Unknown",
  },
  verify: {
    className: "text-accent-cyan border-accent-cyan/50 bg-accent-cyan/10",
    label: "Verify",
  },
  error: {
    className: "text-status-taken border-status-taken/50 bg-status-taken/15",
    label: "Error",
  },
};

type CheckStatusBadgeProps = {
  status: CheckStatus;
  message?: string;
  compact?: boolean;
};

export function CheckStatusBadge({ status, message, compact }: CheckStatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-medium ${style.className} ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
      title={message}
    >
      {status === "loading" ? (
        <Loader2 className={`animate-spin ${compact ? "h-2.5 w-2.5" : "h-3 w-3"}`} aria-hidden />
      ) : status === "available" ? (
        <Check className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      ) : status === "verify" || status === "unknown" ? (
        <HelpCircle className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      ) : status === "taken" || status === "error" ? (
        <X className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      ) : null}
      {style.label}
    </span>
  );
}
