import { randomBytes } from "crypto";
import type { ApiPlan } from "@/lib/api/plans";
import type { ApiKeyRecord } from "@/lib/api/keys";
import { getApiRedis } from "@/lib/api/redis-client";

const SECRET_PREFIX = "ynh:apikey:secret:";
const SUB_PREFIX = "ynh:apikey:sub:";
const CHECKOUT_PREFIX = "ynh:apikey:checkout:";
const EMAIL_PREFIX = "ynh:apikey:email:";

export type StoredApiKey = ApiKeyRecord & {
  secret: string;
  email?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  active: boolean;
  createdAt: number;
};

function keyIdFromSecret(secret: string): string {
  if (secret.length <= 12) {
    return secret;
  }
  return `${secret.slice(0, 8)}…${secret.slice(-4)}`;
}

export function generateApiKeySecret(): string {
  return `ynh_live_${randomBytes(24).toString("base64url")}`;
}

function toRecord(stored: StoredApiKey): ApiKeyRecord {
  return {
    id: stored.id,
    plan: stored.plan,
    label: stored.label,
  };
}

export async function storeApiKey(input: {
  secret?: string;
  plan: ApiPlan;
  label: string;
  email?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  checkoutSessionId?: string;
}): Promise<StoredApiKey> {
  const redis = getApiRedis();
  if (!redis) {
    throw new Error("Redis is required to store API keys.");
  }

  const secret = input.secret ?? generateApiKeySecret();
  const stored: StoredApiKey = {
    secret,
    id: keyIdFromSecret(secret),
    plan: input.plan,
    label: input.label,
    email: input.email,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    active: true,
    createdAt: Date.now(),
  };

  const pipeline = redis.pipeline();
  pipeline.set(`${SECRET_PREFIX}${secret}`, stored);

  if (input.stripeSubscriptionId) {
    pipeline.set(`${SUB_PREFIX}${input.stripeSubscriptionId}`, secret);
  }

  if (input.checkoutSessionId) {
    pipeline.set(`${CHECKOUT_PREFIX}${input.checkoutSessionId}`, secret, {
      ex: 86_400,
    });
  }

  if (input.email) {
    pipeline.set(`${EMAIL_PREFIX}${input.email.toLowerCase()}`, secret);
  }

  await pipeline.exec();
  return stored;
}

export async function lookupStoredApiKey(
  secret: string,
): Promise<ApiKeyRecord | null> {
  const redis = getApiRedis();
  if (!redis) {
    return null;
  }

  try {
    const stored = await redis.get<StoredApiKey>(`${SECRET_PREFIX}${secret}`);
    if (!stored?.active) {
      return null;
    }
    return toRecord(stored);
  } catch {
    return null;
  }
}

export async function getStoredApiKeyByCheckoutSession(
  sessionId: string,
): Promise<StoredApiKey | null> {
  const redis = getApiRedis();
  if (!redis) {
    return null;
  }

  try {
    const secret = await redis.get<string>(`${CHECKOUT_PREFIX}${sessionId}`);
    if (!secret) {
      return null;
    }

    const stored = await redis.get<StoredApiKey>(`${SECRET_PREFIX}${secret}`);
    if (!stored?.active) {
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export async function getStoredApiKeyByEmail(
  email: string,
): Promise<StoredApiKey | null> {
  const redis = getApiRedis();
  if (!redis) {
    return null;
  }

  try {
    const secret = await redis.get<string>(`${EMAIL_PREFIX}${email.toLowerCase()}`);
    if (!secret) {
      return null;
    }

    const stored = await redis.get<StoredApiKey>(`${SECRET_PREFIX}${secret}`);
    if (!stored?.active) {
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export async function subscriptionHasApiKey(
  subscriptionId: string,
): Promise<boolean> {
  const redis = getApiRedis();
  if (!redis) {
    return false;
  }

  try {
    const secret = await redis.get<string>(`${SUB_PREFIX}${subscriptionId}`);
    return Boolean(secret);
  } catch {
    return false;
  }
}

export async function deactivateApiKeyBySubscription(
  subscriptionId: string,
): Promise<boolean> {
  const redis = getApiRedis();
  if (!redis) {
    return false;
  }

  try {
    const secret = await redis.get<string>(`${SUB_PREFIX}${subscriptionId}`);
    if (!secret) {
      return false;
    }

    const stored = await redis.get<StoredApiKey>(`${SECRET_PREFIX}${secret}`);
    if (!stored) {
      return false;
    }

    stored.active = false;
    await redis.set(`${SECRET_PREFIX}${secret}`, stored);
    return true;
  } catch {
    return false;
  }
}

export async function getStripeCustomerIdForSecret(
  secret: string,
): Promise<string | null> {
  const redis = getApiRedis();
  if (!redis) {
    return null;
  }

  try {
    const stored = await redis.get<StoredApiKey>(`${SECRET_PREFIX}${secret}`);
    return stored?.stripeCustomerId ?? null;
  } catch {
    return null;
  }
}
