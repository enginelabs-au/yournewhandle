"use client";

import Link from "next/link";
import {
  Code2,
  Globe,
  Music,
  Search,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { FOOTER_COLUMNS, type FooterColumn } from "@/lib/footer-navigation";

const COLUMN_ICONS = {
  search: Search,
  sparkles: Sparkles,
  users: Users,
  video: Video,
  code: Code2,
  music: Music,
} as const;

function FooterColumnBlock({ column }: { column: FooterColumn }) {
  const Icon = COLUMN_ICONS[column.icon] ?? Globe;

  return (
    <div className="dr-footer-column">
      <div className={`dr-footer-column-head dr-footer-accent-${column.accent}`}>
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        <span>{column.title}</span>
      </div>
      <ul className="dr-footer-link-list">
        {column.links.map((link) => (
          <li key={`${column.id}-${link.label}`}>
            <Link
              href={link.href}
              className="dr-footer-link"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link href={column.viewAllHref} className="dr-footer-view-all">
        View all →
      </Link>
    </div>
  );
}

export function DnsRobotFooter() {
  const { t } = useAppPreferences();

  return (
    <footer className="dr-footer mt-auto border-t border-dr-border">
      <div className="mx-auto max-w-[1680px] px-4 py-10 lg:px-6 lg:py-12">
        <div className="dr-footer-grid grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-8">
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumnBlock key={column.id} column={column} />
          ))}
        </div>

        <div className="dr-footer-brand mt-10 flex flex-col items-center gap-3 border-t border-dr-border/60 pt-8 text-center">
          <Link href="/" className="group inline-flex flex-col items-center gap-3 sm:flex-row">
            <div className="dr-logo-box dr-logo-pulse relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <span className="dr-logo-at-sign relative z-10 text-xl font-extrabold leading-none" aria-hidden>
                @
              </span>
              <span className="dr-logo-ring absolute inset-0 rounded-xl" aria-hidden />
            </div>
            <div>
              <span className="dr-brand-title block text-lg font-bold">yournewhandle</span>
              <span className="block text-xs text-dr-muted">{t("footerLine1")}</span>
            </div>
          </Link>
          <p className="dr-footer-copy text-[11px] text-dr-muted/70">
            © {new Date().getFullYear()} yournewhandle.com.au
          </p>
        </div>
      </div>
    </footer>
  );
}
