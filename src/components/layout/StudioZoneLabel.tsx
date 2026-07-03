"use client";

import { Search, Sparkles } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import type { WorkflowDirection } from "@/hooks/useWorkflowPipeline";
import { PLATFORM_COUNT } from "@/lib/platforms-registry";

type StudioZoneLabelProps = {
  zone: "check" | "generate";
  direction: WorkflowDirection;
};

export function StudioZoneLabel({ zone, direction }: StudioZoneLabelProps) {
  const { t } = useAppPreferences();
  const isGenerateFirst = direction === "generate-check";
  const isCheck = zone === "check";

  const isFirstStep =
    (isCheck && !isGenerateFirst) || (!isCheck && isGenerateFirst);

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
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-zinc-100">{label}</span>
          {isFirstStep ? (
            <span className="studio-zone-step-badge">{t("step1")}</span>
          ) : (
            <span className="studio-zone-step-badge studio-zone-step-badge-muted">{t("step2")}</span>
          )}
        </div>
        <p className="text-[11px] text-dr-muted">{sub}</p>
      </div>
    </div>
  );
}
