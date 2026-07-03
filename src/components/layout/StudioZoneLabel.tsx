"use client";

import { Search, Sparkles } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";

type StudioZoneLabelProps = {
  zone: "check" | "generate";
};

export function StudioZoneLabel({ zone }: StudioZoneLabelProps) {
  const { t } = useAppPreferences();
  const isCheck = zone === "check";

  const Icon = isCheck ? Search : Sparkles;
  const label = isCheck ? t("check") : t("generate");
  const sub = isCheck
    ? t("checkSub", { count: PLATFORM_COUNT })
    : t("generateSub");

  return (
    <div
      className={`studio-zone-label ${isCheck ? "studio-zone-check" : "studio-zone-generate"}`}
    >
      <div
        className={`studio-zone-icon ${isCheck ? "studio-zone-icon-check" : "studio-zone-icon-generate"}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-bold tracking-tight text-zinc-100">{label}</span>
        <p className="mt-0.5 text-[11px] text-dr-muted">{sub}</p>
      </div>
    </div>
  );
}
