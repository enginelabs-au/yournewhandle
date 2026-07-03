import { hasMxRecords } from "./dns";

export type DomainCheckResult = {
  tld: string;
  fqdn: string;
  status: "loading" | "available" | "taken" | "unknown" | "error";
  message?: string;
  source?: "rdap" | "dns";
};

const CHECK_TIMEOUT_MS = 10000;

export async function checkDomain(
  handle: string,
  tld: string,
  signal: AbortSignal,
): Promise<DomainCheckResult> {
  const normalizedTld = tld.startsWith(".") ? tld : `.${tld}`;
  const fqdn = `${handle}${normalizedTld}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort);

  try {
    const response = await fetch(
      `/api/check-domain?handle=${encodeURIComponent(handle)}&tld=${encodeURIComponent(normalizedTld)}`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      return {
        tld: normalizedTld,
        fqdn,
        status: "error",
        message: "Domain check request failed",
      };
    }

    const data = (await response.json()) as DomainCheckResult;
    return {
      tld: data.tld,
      fqdn: data.fqdn,
      status: data.status,
      message: data.message,
      source: data.source,
    };
  } catch {
    return {
      tld: normalizedTld,
      fqdn,
      status: "error",
      message: "Domain check failed or timed out",
    };
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
  }
}

export async function checkMxRecords(
  domain: string,
  signal: AbortSignal,
): Promise<boolean> {
  return hasMxRecords(domain, signal);
}

export async function checkDomains(
  handle: string,
  tlds: string[],
  signal: AbortSignal,
): Promise<DomainCheckResult[]> {
  return Promise.all(tlds.map((tld) => checkDomain(handle, tld, signal)));
}
