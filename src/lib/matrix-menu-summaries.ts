import { findActivePreset } from "@/lib/generator-presets";
import { LANGUAGE_LABELS } from "@/lib/matrix-validation";
import { LANGUAGE_IDS, type GenerationParams } from "@/lib/types";

export function presetsMenuSummary(params: GenerationParams): string {
  return findActivePreset(params)?.label ?? "Custom mix";
}

export function generationMenuSummary(params: GenerationParams): string {
  return `${params.mode} · ${params.minLen}–${params.maxLen} chars · batch ${params.batchSize}`;
}

export function phoneticsMenuSummary(params: GenerationParams): string {
  const languages = LANGUAGE_IDS.filter((id) => params.languageWeights[id] > 0)
    .map((id) => LANGUAGE_LABELS[id])
    .join(" + ");
  const mood =
    params.moodVector === "default" ? null : `${params.moodVector} mood`;
  return [languages || "No languages", mood].filter(Boolean).join(" · ");
}

export function characterMenuSummary(params: GenerationParams): string {
  const parts: string[] = [];
  if (params.blockedConsonants.length > 0) {
    parts.push(`${params.blockedConsonants.length} consonants blocked`);
  }
  if (params.prefix) {
    parts.push(`prefix "${params.prefix}"`);
  }
  if (params.suffix) {
    parts.push(`suffix "${params.suffix}"`);
  }
  return parts.join(" · ") || "All vowels · no locks";
}

export function pipelineMenuSummary(params: GenerationParams): string {
  const parts: string[] = [];
  if (params.targetPlatforms.length > 0) {
    parts.push(`${params.targetPlatforms.length} platform${params.targetPlatforms.length === 1 ? "" : "s"}`);
  }
  if (params.seed) {
    parts.push("seed locked");
  }
  return parts.join(" · ") || "Random · no platform targets";
}

export function enginePreviewSummary(params: GenerationParams): string {
  return `${params.casing} case · ${params.batchSize} handles`;
}
