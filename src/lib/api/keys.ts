import type { ApiPlan } from "@/lib/api/plans";

export type ApiKeyRecord = {
  id: string;
  plan: ApiPlan;
  label: string;
};

const VALID_PLANS = new Set<ApiPlan>(["starter", "pro", "enterprise"]);

function parsePlan(raw: string | undefined): ApiPlan {
  const plan = (raw?.trim().toLowerCase() ?? "starter") as ApiPlan;
  return VALID_PLANS.has(plan) ? plan : "starter";
}

function keyIdFromSecret(secret: string): string {
  if (secret.length <= 12) {
    return secret;
  }
  return `${secret.slice(0, 8)}…${secret.slice(-4)}`;
}

let cachedKeys: Map<string, ApiKeyRecord> | null = null;

function loadKeys(): Map<string, ApiKeyRecord> {
  if (cachedKeys) {
    return cachedKeys;
  }

  const map = new Map<string, ApiKeyRecord>();
  const raw = process.env.YNH_API_KEYS?.trim();

  if (raw) {
    for (const entry of raw.split(",")) {
      const trimmed = entry.trim();
      if (!trimmed) {
        continue;
      }

      const parts = trimmed.split(":");
      const secret = parts[0]?.trim();
      if (!secret) {
        continue;
      }

      const plan = parsePlan(parts[1]);
      const label = parts.slice(2).join(":").trim() || keyIdFromSecret(secret);

      map.set(secret, {
        id: keyIdFromSecret(secret),
        plan,
        label,
      });
    }
  }

  cachedKeys = map;
  return map;
}

export function lookupApiKey(secret: string | null): ApiKeyRecord | null {
  if (!secret) {
    return null;
  }

  return loadKeys().get(secret) ?? null;
}

export function isApiEnabled(): boolean {
  return loadKeys().size > 0;
}

export function apiKeysConfiguredCount(): number {
  return loadKeys().size;
}
