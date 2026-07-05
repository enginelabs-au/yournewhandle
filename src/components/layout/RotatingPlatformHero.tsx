"use client";

import { useMemo } from "react";
import { AlertCircle, Check } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { useVerifiedHeroHandles } from "@/hooks/useVerifiedHeroHandles";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";
import type { GenerationParams } from "@/lib/types";

type RotatingPlatformHeroProps = {
  params: GenerationParams;
};

export function RotatingPlatformHero({ params }: RotatingPlatformHeroProps) {
  const { t } = useAppPreferences();

  const heroParams = useMemo(
    () => ({
      ...params,
      batchSize: 1,
      aestheticStrictness: 0 as const,
      filterCollisions: false,
    }),
    [
      params.affixPlacement,
      params.affixTier,
      params.allowedVowels,
      params.batchSize,
      params.blockedConsonants,
      params.blendOverlap,
      params.blueprint,
      params.casing,
      params.clutterGuard,
      params.compound,
      params.dictionaryWeight,
      params.echoType,
      params.endingStyle,
      params.entropy,
      params.languageWeights,
      params.maxLen,
      params.minLen,
      params.mode,
      params.moodVector,
      params.phoneticEcho,
      params.prefix,
      params.strictMora,
      params.suffix,
      params.syllableCount,
      params.targetPlatforms,
      params.vowelHarmony,
    ],
  );

  const { displayHandle, isReady, animating } = useVerifiedHeroHandles(heroParams);

  const titleText = displayHandle ?? "···";

  return (
    <div className="hero-section mb-4 animate-fade-in-up">
      <h1 className="hero-title mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        <span className="hero-platform-slot inline-flex overflow-hidden font-mono text-2xl font-bold sm:text-3xl lg:text-[2.35rem]">
          <span
            key={displayHandle ?? "loading"}
            className={`hero-platform-word dr-title-gradient whitespace-nowrap ${animating ? "hero-platform-out" : "hero-platform-in"} ${!isReady ? "opacity-70" : ""}`}
          >
            {titleText}
          </span>
        </span>

        {displayHandle ? (
          <span className="hero-available-bubble inline-flex items-center gap-2">
            <Check className="hero-available-icon h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{t("handleAvailable")}</span>
            <AlertCircle className="hero-available-icon h-3.5 w-3.5 shrink-0" aria-hidden />
          </span>
        ) : null}
      </h1>

      <p className="hero-section-description mx-auto mt-4 max-w-2xl animate-fade-in-up animation-delay-150 text-center text-sm leading-relaxed sm:text-base">
        {t("heroDescription", { count: PLATFORM_COUNT })}
      </p>
    </div>
  );
}
