"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_COLOR_THEME,
  type ColorTheme,
  nextColorTheme,
  normalizeStoredTheme,
} from "@/lib/color-themes";
import {
  DEFAULT_LOCALE,
  interpolate,
  isLocale,
  type Locale,
  type MessageKey,
  type Messages,
} from "@/lib/i18n/languages";
import { MESSAGES } from "@/lib/i18n/messages";

function readStoredTheme(): ColorTheme {
  if (typeof window === "undefined") return DEFAULT_COLOR_THEME;
  return normalizeStoredTheme(localStorage.getItem("ynh-theme"));
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const savedLocale = localStorage.getItem("ynh-locale");
  return savedLocale && isLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
}

type AppPreferencesContextValue = {
  theme: ColorTheme;
  locale: Locale;
  hydrated: boolean;
  cycleTheme: () => void;
  setTheme: (theme: ColorTheme) => void;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  messages: Messages;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(
  null,
);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>(DEFAULT_COLOR_THEME);
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setLocaleState(readStoredLocale());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.lang = locale;
    document.documentElement.dir =
      locale === "ar" || locale === "he" || locale === "fa" ? "rtl" : "ltr";
    localStorage.setItem("ynh-theme", theme);
    localStorage.setItem("ynh-locale", locale);
  }, [theme, locale, hydrated]);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => nextColorTheme(current));
  }, []);

  const setTheme = useCallback((next: ColorTheme) => {
    setThemeState(next);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const messages = MESSAGES[locale] ?? MESSAGES.en;

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>) => {
      const template = messages[key] ?? MESSAGES.en[key];
      return params ? interpolate(template, params) : template;
    },
    [messages],
  );

  const value = useMemo(
    () => ({
      theme,
      locale,
      hydrated,
      cycleTheme,
      setTheme,
      setLocale,
      t,
      messages,
    }),
    [theme, locale, hydrated, cycleTheme, setTheme, setLocale, t, messages],
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }
  return context;
}

/** @deprecated Use ColorTheme from @/lib/color-themes */
export type Theme = ColorTheme;
