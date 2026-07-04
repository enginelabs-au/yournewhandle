"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { ApiNavMenu } from "@/components/layout/ApiNavMenu";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { PLATFORM_COUNT, PLATFORM_REGISTRY } from "@/lib/platforms-registry";

export function DnsRobotHeader() {
  const { t } = useAppPreferences();
  const [platformIndex, setPlatformIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlatformIndex((current) => (current + 1) % PLATFORM_REGISTRY.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const platform = PLATFORM_REGISTRY[platformIndex]!;

  return (
    <header className="dr-header dr-header-glow sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="dr-header-shimmer pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden />

      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="group relative z-10 flex min-w-0 shrink items-center gap-3">
          <div className="dr-logo-box dr-logo-pulse relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <span className="dr-logo-at-sign relative z-10 text-xl font-extrabold leading-none" aria-hidden>
              @
            </span>
            <span className="dr-logo-ring absolute inset-0 rounded-xl" aria-hidden />
          </div>

          <div className="min-w-0 leading-tight">
            <span className="dr-brand-title block truncate text-sm font-bold sm:text-base">
              yournewhandle
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-dr-muted sm:text-[11px]">
              <span className="dr-header-platform font-medium text-dr-blue-light transition-opacity duration-300">
                {platform.name}
              </span>
            </span>
          </div>
        </Link>

        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
          <div className="dr-header-badge hidden items-center gap-1.5 rounded-full px-3 py-1.5 sm:flex">
            <span className="dr-live-dot h-1.5 w-1.5 rounded-full" aria-hidden />
            <Zap className="h-3 w-3 text-dr-amber" aria-hidden />
            <span className="text-[11px] font-medium text-zinc-300">
              {t("platformsBadge", { count: PLATFORM_COUNT })}
            </span>
          </div>

          <ApiNavMenu />
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
