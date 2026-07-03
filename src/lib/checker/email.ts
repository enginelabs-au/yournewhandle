import type { CheckStatus } from "@/lib/types";
import type { DomainCheckResult } from "./domains";
import { checkMxRecords } from "./domains";
import { md5 } from "./md5";

export type EmailCheckResult = {
  label: string;
  target: string;
  status: CheckStatus;
  message?: string;
};

async function checkGravatar(
  email: string,
  signal: AbortSignal,
): Promise<EmailCheckResult> {
  const hash = md5(email.trim().toLowerCase());
  try {
    const response = await fetch(
      `https://www.gravatar.com/avatar/${hash}?d=404`,
      { signal, method: "GET", mode: "cors" },
    );

    if (response.status === 404) {
      return {
        label: email,
        target: email,
        status: "available",
        message: "Gravatar not found — likely unused",
      };
    }

    if (response.status === 200) {
      return {
        label: email,
        target: email,
        status: "taken",
        message: "Gravatar profile exists",
      };
    }

    return {
      label: email,
      target: email,
      status: "unknown",
      message: "Gravatar check inconclusive",
    };
  } catch {
    return {
      label: email,
      target: email,
      status: "error",
      message: "Gravatar check failed",
    };
  }
}

export async function checkEmails(
  handle: string,
  domainResults: DomainCheckResult[],
  signal: AbortSignal,
): Promise<EmailCheckResult[]> {
  const gmail = `${handle}@gmail.com`;
  const gravatarResult = await checkGravatar(gmail, signal);

  const comResult = domainResults.find((d) => d.tld === ".com");
  const ownedDomain = `${handle}.com`;

  const rows: EmailCheckResult[] = [gravatarResult];

  if (comResult?.status === "available") {
    const hasMx = await checkMxRecords(ownedDomain, signal);
    rows.push({
      label: `hello@${ownedDomain}`,
      target: `hello@${ownedDomain}`,
      status: hasMx ? "taken" : "available",
      message: hasMx
        ? "MX records configured on domain"
        : "No MX on domain — mail not configured",
    });
  } else if (comResult?.status === "taken") {
    rows.push({
      label: `hello@${ownedDomain}`,
      target: `hello@${ownedDomain}`,
      status: "unknown",
      message: "N/A — .com domain taken",
    });
  } else {
    rows.push({
      label: `hello@${ownedDomain}`,
      target: `hello@${ownedDomain}`,
      status: "verify",
      message: "Verify after .com DNS result",
    });
  }

  return rows;
}
