type DnsAnswer = {
  name?: string;
  type?: number;
  data?: string;
};

type DnsResponse = {
  Status?: number;
  Answer?: DnsAnswer[];
};

const DNS_TIMEOUT_MS = 5000;

export async function fetchDns(
  name: string,
  type: "A" | "MX",
  signal?: AbortSignal,
): Promise<DnsResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS);

  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
      { signal: controller.signal },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as DnsResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

export type DnsAvailability = "available" | "taken" | "unknown" | "error";

export async function checkDnsAvailability(
  fqdn: string,
  signal?: AbortSignal,
): Promise<{ status: DnsAvailability; message: string }> {
  const data = await fetchDns(fqdn, "A", signal);

  if (!data) {
    return {
      status: "error",
      message: "DNS lookup failed or timed out",
    };
  }

  if (data.Status === 3) {
    return {
      status: "available",
      message: "Likely available (DNS)",
    };
  }

  if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
    return {
      status: "taken",
      message: "DNS record exists",
    };
  }

  return {
    status: "unknown",
    message: "Inconclusive — verify with registrar",
  };
}

export async function hasMxRecords(
  domain: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const data = await fetchDns(domain, "MX", signal);
  return Boolean(data?.Status === 0 && data.Answer && data.Answer.length > 0);
}
