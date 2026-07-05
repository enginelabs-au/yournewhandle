export type ApiPlan = "starter" | "pro" | "enterprise";

export type ApiPlanLimits = {
  requestsPerMinute: number;
  requestsPerDay: number;
  maxBatchHandles: number;
  maxBatchPlatforms: number;
  allowDeepCheck: boolean;
  allowAiGenerate: boolean;
  maxGenerateBatch: number;
};

export const API_PLAN_LIMITS: Record<ApiPlan, ApiPlanLimits> = {
  starter: {
    requestsPerMinute: 20,
    requestsPerDay: 500,
    maxBatchHandles: 3,
    maxBatchPlatforms: 50,
    allowDeepCheck: false,
    allowAiGenerate: false,
    maxGenerateBatch: 12,
  },
  pro: {
    requestsPerMinute: 120,
    requestsPerDay: 25_000,
    maxBatchHandles: 20,
    maxBatchPlatforms: 400,
    allowDeepCheck: true,
    allowAiGenerate: true,
    maxGenerateBatch: 48,
  },
  enterprise: {
    requestsPerMinute: 600,
    requestsPerDay: 500_000,
    maxBatchHandles: 100,
    maxBatchPlatforms: 400,
    allowDeepCheck: true,
    allowAiGenerate: true,
    maxGenerateBatch: 100,
  },
};

export const API_PLAN_PRICING: Record<
  ApiPlan,
  { label: string; price: string; description: string }
> = {
  starter: {
    label: "Starter",
    price: "$19/mo",
    description: "Light checks on popular platforms, phonetic generation.",
  },
  pro: {
    label: "Pro",
    price: "$79/mo",
    description: "Full platform catalog, batch checks, AI generation.",
  },
  enterprise: {
    label: "Enterprise",
    price: "$199/mo + usage",
    description:
      "$199 monthly platform fee, then graduated per-request usage on your monthly invoice.",
  },
};

/** Matches Stripe graduated meter price (price_1Tpi8JGhxUROb8kXPWdUzrko). */
export const ENTERPRISE_USAGE_TIERS: readonly {
  label: string;
  detail: string;
}[] = [
  {
    label: "First 500,000 requests/mo",
    detail: "$0 usage charge (covered by platform fee)",
  },
  {
    label: "500,001 – 2,000,000 requests/mo",
    detail: "$2.00 per 1,000 requests ($0.002 each)",
  },
  {
    label: "2,000,001+ requests/mo",
    detail: "$1.00 per 1,000 requests ($0.001 each)",
  },
];
