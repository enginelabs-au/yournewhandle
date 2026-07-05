"use client";

import Link from "next/link";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { SiteContactLinks } from "@/components/layout/SiteContactLinks";
import { SITE_HELLO_EMAIL, SITE_HELLO_MAILTO } from "@/lib/site/contact";
import { SITE_DOMAIN, SITE_LEGAL_PATHS } from "@/lib/site/config";

export function DnsRobotFooter() {
  const { t } = useAppPreferences();

  return (
    <footer className="dr-footer mt-auto border-t border-dr-border">
      <div className="mx-auto max-w-[1680px] px-4 py-8 lg:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div id="contact">
            <h2 className="dr-footer-column-head dr-footer-accent-cyan">Contact</h2>
            <SiteContactLinks />
          </div>

          <div>
            <h2 className="dr-footer-column-head dr-footer-accent-blue">Product</h2>
            <ul className="dr-footer-link-list">
              <li>
                <Link href="/" className="dr-footer-link">
                  Handle generator
                </Link>
              </li>
              <li>
                <Link href="/developers" className="dr-footer-link">
                  API &amp; developers
                </Link>
              </li>
              <li>
                <Link href={SITE_LEGAL_PATHS.support} className="dr-footer-link">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="dr-footer-column-head dr-footer-accent-purple">Legal</h2>
            <ul className="dr-footer-link-list">
              <li>
                <Link href={SITE_LEGAL_PATHS.terms} className="dr-footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href={SITE_LEGAL_PATHS.privacy} className="dr-footer-link">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

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
            © {new Date().getFullYear()} {SITE_DOMAIN} ·{" "}
            <a href={SITE_HELLO_MAILTO} className="hover:text-dr-muted">
              {SITE_HELLO_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
