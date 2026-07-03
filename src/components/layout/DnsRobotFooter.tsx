"use client";

import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesProvider";

export function DnsRobotFooter() {
  const { t } = useAppPreferences();

  return (
    <footer className="dr-footer mt-auto border-t border-dr-border">
      <div className="mx-auto max-w-[1680px] px-4 py-8 lg:px-6">
        <div className="dr-footer-brand flex flex-col items-center gap-3 text-center">
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
