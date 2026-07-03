import { NextResponse } from "next/server";
import { checkDnsAvailability } from "@/lib/checker/dns";
import { checkRdapAvailability } from "@/lib/checker/rdap";
import { isValidHostname, normalizeHandleForCheck } from "@/lib/checker/constants";

export type DomainCheckResponse = {
  tld: string;
  fqdn: string;
  status: "available" | "taken" | "unknown" | "error";
  message?: string;
  source?: "rdap" | "dns";
};

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get("handle") ?? "";
  const tld = searchParams.get("tld") ?? "";

  const normalized = normalizeHandleForCheck(handle);
  const normalizedTld = tld.startsWith(".") ? tld : `.${tld}`;

  if (!normalized || !isValidHostname(normalized) || !tld) {
    return NextResponse.json(
      { error: "Invalid handle or TLD" },
      { status: 400 },
    );
  }

  const fqdn = `${normalized}${normalizedTld}`;

  const rdap = await checkRdapAvailability(fqdn, normalizedTld);

  if (rdap.status === "available" || rdap.status === "taken") {
    const body: DomainCheckResponse = {
      tld: normalizedTld,
      fqdn,
      status: rdap.status,
      message: rdap.message,
      source: "rdap",
    };
    return NextResponse.json(body);
  }

  const dns = await checkDnsAvailability(fqdn);

  const body: DomainCheckResponse = {
    tld: normalizedTld,
    fqdn,
    status: dns.status,
    message:
      rdap.status === "unsupported"
        ? dns.message
        : `${rdap.message} — ${dns.message}`,
    source: "dns",
  };

  return NextResponse.json(body);
}
