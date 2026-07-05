import type { ApiPlan } from "@/lib/api/plans";

export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://yournewhandle.com";
  return url.startsWith("http") ? url.replace(/\/$/, "") : `https://${url}`;
}

export function stripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

export function stripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function stripeBillingPortalConfiguration(): string | null {
  return process.env.STRIPE_BILLING_PORTAL_CONFIGURATION?.trim() || null;
}

export function stripeMeterEventName(): string {
  return process.env.STRIPE_METER_EVENT_NAME?.trim() || "api_request";
}

export function stripePriceIdForPlan(plan: ApiPlan): string | null {
  const map: Record<ApiPlan, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };
  return map[plan]?.trim() || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    stripeSecretKey() &&
      stripePriceIdForPlan("starter") &&
      stripePriceIdForPlan("pro") &&
      stripePriceIdForPlan("enterprise"),
  );
}
