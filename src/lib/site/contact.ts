import { SITE_DOMAIN } from "@/lib/site/config";

/** Public contact addresses (Cloudflare Email Routing). */
export const SITE_CONTACT_DOMAIN = SITE_DOMAIN;

export const SITE_HELLO_EMAIL = `hello@${SITE_CONTACT_DOMAIN}`;
export const SITE_SUPPORT_EMAIL = `support@${SITE_CONTACT_DOMAIN}`;

export const SITE_HELLO_MAILTO = `mailto:${SITE_HELLO_EMAIL}`;
export const SITE_SUPPORT_MAILTO = `mailto:${SITE_SUPPORT_EMAIL}`;
