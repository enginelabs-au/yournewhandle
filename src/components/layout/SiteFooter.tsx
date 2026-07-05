"use client";

import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { SITE_HELLO_EMAIL, SITE_HELLO_MAILTO } from "@/lib/site/contact";
import { SITE_DOMAIN, SITE_LEGAL_PATHS } from "@/lib/site/config";

const MINI_LINKS = [
  { href: SITE_LEGAL_PATHS.terms, label: "Terms" },
  { href: SITE_LEGAL_PATHS.privacy, label: "Privacy" },
  { href: SITE_LEGAL_PATHS.support, label: "Support" },
  { href: "/developers", label: "API" },
] as const;

export function SiteFooter() {
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

          <nav className="site-footer-mini-menu" aria-label="Site links">
            {MINI_LINKS.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-2">
                {index > 0 ? (
                  <span className="site-footer-mini-sep" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link href={item.href}>{item.label}</Link>
              </span>
            ))}
            <span className="site-footer-mini-sep" aria-hidden>
              ·
            </span>
            <a href={SITE_HELLO_MAILTO}>{SITE_HELLO_EMAIL}</a>
          </nav>

          <p className="dr-footer-copy text-[10px] text-dr-muted/60">
            © {new Date().getFullYear()} {SITE_DOMAIN}
          </p>
        </div>
      </div>
    </footer>
  );
}
