import { NextResponse } from "next/server";
import type { ApiPlan } from "@/lib/api/plans";
import { getStripe } from "@/lib/stripe/client";
import {
  isStripeConfigured,
  siteUrl,
  stripeBillingPortalConfiguration,
  stripePriceIdForPlan,
} from "@/lib/stripe/config";

const VALID_PLANS = new Set<ApiPlan>(["starter", "pro", "enterprise"]);

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe billing is not configured." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe billing is not configured." },
      { status: 503 },
    );
  }

  let body: { plan?: string };
  try {
    body = (await request.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = body.plan?.trim().toLowerCase() as ApiPlan;
  if (!VALID_PLANS.has(plan)) {
    return NextResponse.json(
      { error: "plan must be starter, pro, or enterprise." },
      { status: 400 },
    );
  }

  const priceId = stripePriceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `No Stripe price configured for ${plan}.` },
      { status: 503 },
    );
  }

  const origin = siteUrl();

  try {
    const price = await stripe.prices.retrieve(priceId);
    const isMetered = price.recurring?.usage_type === "metered";

    const lineItems: { price: string; quantity?: number }[] = isMetered
      ? [{ price: priceId }]
      : [{ price: priceId, quantity: 1 }];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: lineItems,
      success_url: `${origin}/developers?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/developers?checkout=cancelled`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      metadata: { plan },
      subscription_data: {
        metadata: { plan },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start checkout.";
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  const portalConfiguration = stripeBillingPortalConfiguration();
  return NextResponse.json({
    configured: isStripeConfigured(),
    portalConfigurationId: portalConfiguration ?? null,
  });
}
