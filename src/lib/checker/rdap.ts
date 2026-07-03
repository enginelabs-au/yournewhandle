export type RdapAvailability = "available" | "taken" | "unsupported" | "error";

const RDAP_TIMEOUT_MS = 8000;

const RDAP_BASES: Record<string, string> = {
  ".com": "https://rdap.verisign.com/com/v1/domain",
  ".net": "https://rdap.verisign.com/net/v1/domain",
  ".dev": "https://pubapi.registry.google/rdap/domain",
  ".io": "https://rdap.nic.io/domain",
  ".ai": "https://rdap.nic.ai/domain",
  ".xyz": "https://rdap.nic.xyz/domain",
  ".com.au": "https://rdap.auda.org.au/domain",
};

export function getRdapBaseUrl(tld: string): string | null {
  const normalized = tld.startsWith(".") ? tld : `.${tld}`;
  return RDAP_BASES[normalized] ?? null;
}

export async function checkRdapAvailability(
  fqdn: string,
  tld: string,
): Promise<{ status: RdapAvailability; message: string }> {
  const baseUrl = getRdapBaseUrl(tld);
  if (!baseUrl) {
    return {
      status: "unsupported",
      message: "RDAP not configured for this TLD",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/${encodeURIComponent(fqdn)}`, {
      signal: controller.signal,
      headers: { Accept: "application/rdap+json, application/json" },
    });

    if (response.status === 404) {
      return {
        status: "available",
        message: "Not registered (RDAP)",
      };
    }

    if (response.ok) {
      return {
        status: "taken",
        message: "Registered (RDAP)",
      };
    }

    return {
      status: "error",
      message: `RDAP returned ${response.status}`,
    };
  } catch {
    return {
      status: "error",
      message: "RDAP lookup failed or timed out",
    };
  } finally {
    clearTimeout(timeout);
  }
}
