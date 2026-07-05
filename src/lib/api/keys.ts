import type { ApiPlan } from "@/lib/api/plans";
import { lookupStoredApiKey } from "@/lib/api/key-store";
import { isStripeConfigured } from "@/lib/stripe/config";

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

function loadEnvKeys(): Map<string, ApiKeyRecord> {
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

export function lookupEnvApiKey(secret: string | null): ApiKeyRecord | null {
  if (!secret) {
    return null;
  }

  return loadEnvKeys().get(secret) ?? null;
}

export async function lookupApiKey(secret: string | null): Promise<ApiKeyRecord | null> {
  if (!secret) {
    return null;
  }

  const envKey = lookupEnvApiKey(secret);
  if (envKey) {
    return envKey;
  }

  return lookupStoredApiKey(secret);
}

export function isApiEnabled(): boolean {
  if (loadEnvKeys().size > 0) {
    return true;
  }
  return isStripeConfigured();
}

export function apiKeysConfiguredCount(): number {
  return loadEnvKeys().size;
}
