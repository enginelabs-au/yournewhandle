/** Canonical public site URL (Stripe, sitemap, OG). */
export const SITE_DOMAIN = "yournewhandle.com";

export const SITE_URL = `https://${SITE_DOMAIN}`;

export const LEGAL_LAST_UPDATED = "5 July 2026";

export const SITE_LEGAL_PATHS = {
  terms: "/terms",
  privacy: "/privacy",
  support: "/support",
} as const;

export const SITE_LEGAL_URLS = {
  terms: `${SITE_URL}${SITE_LEGAL_PATHS.terms}`,
  privacy: `${SITE_URL}${SITE_LEGAL_PATHS.privacy}`,
  support: `${SITE_URL}${SITE_LEGAL_PATHS.support}`,
  developers: `${SITE_URL}/developers`,
} as const;
