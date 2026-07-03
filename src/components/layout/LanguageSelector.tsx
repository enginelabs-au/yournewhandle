"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAppPreferences } from "@/context/AppPreferencesProvider";
import { LANGUAGES, type Locale } from "@/lib/i18n/languages";

export function LanguageSelector() {
  const { locale, setLocale, t } = useAppPreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0]!;

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="dr-icon-btn flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs"
        aria-label={t("selectLanguage")}
        aria-expanded={open}
      >
        <span className="text-base leading-none" aria-hidden>
          {current.flag}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-dr-muted transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="lang-menu absolute right-0 top-full z-50 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border p-1 shadow-xl">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLocale(lang.code as Locale);
                setOpen(false);
              }}
              className={`lang-menu-item flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                locale === lang.code ? "lang-menu-item-active" : ""
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {lang.flag}
              </span>
              <span className="min-w-0 flex-1 truncate">
              <span className="block font-medium lang-menu-label">
                {lang.nativeLabel}
              </span>
                <span className="block text-[10px] text-dr-muted">{lang.label}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
