import { NextResponse } from "next/server";
import { getStoredApiKeyByCheckoutSession } from "@/lib/api/key-store";
import { getStripe } from "@/lib/stripe/client";
import {
  siteUrl,
  stripeBillingPortalConfiguration,
} from "@/lib/stripe/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id")?.trim();

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required." },
      { status: 400 },
    );
  }

  const stored = await getStoredApiKeyByCheckoutSession(sessionId);
  if (!stored) {
    return NextResponse.json(
      {
        ready: false,
        message:
          "Your API key is still being provisioned. Refresh in a few seconds.",
      },
      { status: 202 },
    );
  }

  let portalUrl: string | null = null;
  const stripe = getStripe();

  if (stripe && stored.stripeCustomerId) {
    try {
      const portal = await stripe.billingPortal.sessions.create({
        customer: stored.stripeCustomerId,
        return_url: `${siteUrl()}/developers`,
        ...(stripeBillingPortalConfiguration()
          ? { configuration: stripeBillingPortalConfiguration()! }
          : {}),
      });
      portalUrl = portal.url;
    } catch (error) {
      console.error("[stripe/session] portal creation failed:", error);
    }
  }

  return NextResponse.json({
    ready: true,
    plan: stored.plan,
    apiKey: stored.secret,
    email: stored.email ?? null,
    portalUrl,
  });
}
