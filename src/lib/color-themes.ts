export type ColorTheme = "dark" | "laser" | "aurora" | "ember" | "void";

export const COLOR_THEMES: ColorTheme[] = [
  "dark",
  "laser",
  "aurora",
  "ember",
  "void",
];

export type ThemeIconId = "moon" | "zap" | "aurora" | "flame" | "eclipse";

export type ThemeMeta = {
  id: ColorTheme;
  label: string;
  icon: ThemeIconId;
  description: string;
};

export const THEME_META: Record<ColorTheme, ThemeMeta> = {
  dark: {
    id: "dark",
    label: "Neon Dark",
    icon: "moon",
    description: "Purple and blue neon on deep charcoal",
  },
  laser: {
    id: "laser",
    label: "Laser Holo",
    icon: "zap",
    description: "Cyan, magenta, and lime holographic contrast",
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    icon: "aurora",
    description: "Bright teal and emerald northern-lights glow",
  },
  ember: {
    id: "ember",
    label: "Ember",
    icon: "flame",
    description: "Warm amber and rose heat on dark copper",
  },
  void: {
    id: "void",
    label: "Void",
    icon: "eclipse",
    description: "Near-black minimal chrome with soft silver edges",
  },
};

export const DEFAULT_COLOR_THEME: ColorTheme = "dark";

export function isColorTheme(value: string): value is ColorTheme {
  return COLOR_THEMES.includes(value as ColorTheme);
}

export function normalizeStoredTheme(value: string | null): ColorTheme {
  if (value === "light") return "laser";
  if (value && isColorTheme(value)) return value;
  return DEFAULT_COLOR_THEME;
}

export function nextColorTheme(current: ColorTheme): ColorTheme {
  const index = COLOR_THEMES.indexOf(current);
  return COLOR_THEMES[(index + 1) % COLOR_THEMES.length]!;
}
