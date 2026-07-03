"use client";

import type { LucideIcon } from "lucide-react";
import {
  Eclipse,
  Flame,
  Moon,
  Sparkles,
  Waves,
  Zap,
} from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { THEME_META, type ThemeIconId } from "@/lib/color-themes";

const ICONS: Record<ThemeIconId, LucideIcon> = {
  moon: Moon,
  zap: Zap,
  aurora: Waves,
  flame: Flame,
  eclipse: Eclipse,
};

export function ThemeSwitcher() {
  const { theme, cycleTheme } = useAppPreferences();
  const meta = THEME_META[theme];
  const Icon = ICONS[meta.icon] ?? Sparkles;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="dr-icon-btn theme-switcher-btn rounded-lg p-2"
      aria-label={`Color mode: ${meta.label}. Click to switch.`}
      title={`${meta.label} — ${meta.description}`}
    >
      <Icon className="h-4 w-4 text-dr-muted" aria-hidden />
    </button>
  );
}
