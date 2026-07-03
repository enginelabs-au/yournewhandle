"use client";

import type { CheckStatus } from "@/lib/types";
import { CheckStatusBadge } from "@/components/ui/CheckStatusBadge";
import { ExternalLink } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Globe,
  GitBranch,
  Mail,
  MessageCircle,
  AtSign,
} from "lucide-react";

type PlatformCardProps = {
  name: string;
  category: string;
  status: CheckStatus;
  message?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

const STATUS_BORDER: Record<string, string> = {
  available: "platform-available",
  taken: "platform-taken",
  unknown: "platform-unknown",
  verify: "platform-verify",
  loading: "platform-loading",
  error: "platform-error",
  idle: "platform-unknown",
};

export function PlatformCard({
  name,
  category,
  status,
  message,
  icon: Icon = Globe,
  action,
}: PlatformCardProps) {
  const borderClass = STATUS_BORDER[status] ?? "platform-unknown";

  return (
    <article
      className={`neon-card neon-card-hover flex flex-col gap-3 rounded-xl p-4 transition ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle/80 bg-panel-elevated/80">
            <Icon className="h-5 w-5 text-accent-cyan" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-100">{name}</p>
            <p className="text-[11px] text-zinc-500">{category}</p>
          </div>
        </div>
        <CheckStatusBadge status={status} message={message} compact />
      </div>
      {message ? (
        <p className="line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
          {message}
        </p>
      ) : null}
      {action ? (
        <div className="mt-auto border-t border-border-subtle/40 pt-2">
          {action}
        </div>
      ) : null}
    </article>
  );
}

export function platformIcon(name: string): LucideIcon {
  const key = name.toLowerCase();
  if (key.includes("github")) return GitBranch;
  if (key.includes("telegram")) return MessageCircle;
  if (key.includes("twitter") || key.includes("x (")) return AtSign;
  if (key.includes("@") || key.includes("email") || key.includes("gmail")) {
    return Mail;
  }
  return Globe;
}

export function PlatformCardLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-accent-blue hover:text-accent-cyan"
    >
      {label}
      <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}
