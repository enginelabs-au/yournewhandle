export type Locale =
  | "en"
  | "zh"
  | "hi"
  | "es"
  | "fr"
  | "ar"
  | "bn"
  | "pt"
  | "ru"
  | "ja"
  | "de"
  | "ko"
  | "tr"
  | "vi"
  | "it"
  | "th"
  | "pl"
  | "uk"
  | "nl"
  | "id"
  | "ms"
  | "fa"
  | "ro"
  | "sv"
  | "cs"
  | "el"
  | "he"
  | "da"
  | "fi"
  | "hu";

export type Messages = {
  handleAvailable: string;
  heroDescription: string;
  headerSubtitle: string;
  platformsBadge: string;
  check: string;
  generate: string;
  step1: string;
  step2: string;
  checkSub: string;
  generateSub: string;
  generateHandles: string;
  generating: string;
  output: string;
  generateCheck: string;
  handleLength: string;
  handleLengthExact: string;
  handleLengthExactHint: string;
  handleLengthRangeHint: string;
  handleLengthMax: string;
  generateRandomly: string;
  generateRandomlyAndCheck: string;
  customGenerate: string;
  randomizing: string;
  checkSuggest: string;
  running: string;
  placeholder: string;
  checkAction: string;
  lightCheck: string;
  deepCheck: string;
  stop: string;
  checkingPlatforms: string;
  checkingBatch: string;
  estimatedRemaining: string;
  checkingHandles: string;
  batchCheckTitle: string;
  batchCheckScope: string;
  batchHandlesLabel: string;
  checkViewBatch: string;
  checkViewAllPlatforms: string;
  free: string;
  taken: string;
  other: string;
  unknown: string;
  platformsReady: string;
  footerLine1: string;
  footerLine2: string;
  filterAll: string;
  filterSocial: string;
  filterMessaging: string;
  filterVideo: string;
  filterCoding: string;
  filterGaming: string;
  filterPro: string;
  filterMusic: string;
  filterOther: string;
  statusPending: string;
  statusAvailable: string;
  statusFree: string;
  statusTaken: string;
  statusUnknown: string;
  emptyGenerateHint: string;
  selectLanguage: string;
  toggleThemeLight: string;
  toggleThemeDark: string;
  flipWorkflow: string;
};

export type LanguageOption = {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
};

/** Top 30 languages by global usage — flag emoji per primary region. */
export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", flag: "🇨🇳" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇧🇩" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", flag: "🇧🇷" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", flag: "🇰🇷" },
  { code: "tr", label: "Turkish", nativeLabel: "Türkçe", flag: "🇹🇷" },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳" },
  { code: "it", label: "Italian", nativeLabel: "Italiano", flag: "🇮🇹" },
  { code: "th", label: "Thai", nativeLabel: "ไทย", flag: "🇹🇭" },
  { code: "pl", label: "Polish", nativeLabel: "Polski", flag: "🇵🇱" },
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська", flag: "🇺🇦" },
  { code: "nl", label: "Dutch", nativeLabel: "Nederlands", flag: "🇳🇱" },
  { code: "id", label: "Indonesian", nativeLabel: "Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Malay", nativeLabel: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "fa", label: "Persian", nativeLabel: "فارسی", flag: "🇮🇷" },
  { code: "ro", label: "Romanian", nativeLabel: "Română", flag: "🇷🇴" },
  { code: "sv", label: "Swedish", nativeLabel: "Svenska", flag: "🇸🇪" },
  { code: "cs", label: "Czech", nativeLabel: "Čeština", flag: "🇨🇿" },
  { code: "el", label: "Greek", nativeLabel: "Ελληνικά", flag: "🇬🇷" },
  { code: "he", label: "Hebrew", nativeLabel: "עברית", flag: "🇮🇱" },
  { code: "da", label: "Danish", nativeLabel: "Dansk", flag: "🇩🇰" },
  { code: "fi", label: "Finnish", nativeLabel: "Suomi", flag: "🇫🇮" },
  { code: "hu", label: "Hungarian", nativeLabel: "Magyar", flag: "🇭🇺" },
];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return LANGUAGES.some((lang) => lang.code === value);
}

export type MessageKey = keyof Messages;

export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
