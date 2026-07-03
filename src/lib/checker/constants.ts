export const DEFAULT_TLDS = [".com", ".ai", ".xyz"] as const;

export const PRESET_TLDS = [
  ".com",
  ".ai",
  ".xyz",
  ".dev",
  ".io",
  ".com.au",
] as const;

export type Tld = (typeof PRESET_TLDS)[number] | string;

export function normalizeHandleForCheck(handle: string): string {
  return handle.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function isValidHostname(handle: string): boolean {
  if (!handle || handle.length > 63) {
    return false;
  }
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(handle);
}

export function buildDomainLookupLink(handle: string, tld: string): string {
  const domain = `${handle}${tld.startsWith(".") ? tld : `.${tld}`}`;
  return `https://lookup.icann.org/en/lookup?name=${encodeURIComponent(domain)}`;
}

export const DNS_LIMITATION_TOOLTIP =
  "Likely available (DNS): NXDOMAIN means no DNS record exists. This does not guarantee the domain is registrable (reserved, premium, or registry rules may apply).";
