"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { HERO_COOL_HANDLES } from "@/lib/hero-handles";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";

const ROTATE_MS = 2600;

export function RotatingPlatformHero() {
  const { t } = useAppPreferences();
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % HERO_COOL_HANDLES.length);
        setAnimating(false);
      }, 280);
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, []);

  const handle = HERO_COOL_HANDLES[index]!;

  return (
    <div className="hero-section mb-4 animate-fade-in-up">
      <h1 className="hero-title mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        <span className="hero-platform-slot inline-flex overflow-hidden font-mono text-2xl font-bold sm:text-3xl lg:text-[2.35rem]">
          <span
            key={handle}
            className={`hero-platform-word dr-title-gradient whitespace-nowrap ${animating ? "hero-platform-out" : "hero-platform-in"}`}
          >
            {handle}
          </span>
        </span>

        <span className="hero-available-bubble inline-flex items-center gap-2">
          <Check className="hero-available-icon h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{t("handleAvailable")}</span>
          <AlertCircle className="hero-available-icon h-3.5 w-3.5 shrink-0" aria-hidden />
        </span>
      </h1>

      <p className="mx-auto mt-4 max-w-2xl animate-fade-in-up animation-delay-150 text-center text-sm leading-relaxed text-dr-muted sm:text-base">
        {t("heroDescription", { count: PLATFORM_COUNT })}
      </p>
    </div>
  );
}
