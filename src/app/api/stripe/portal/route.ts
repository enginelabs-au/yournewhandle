import { NextResponse } from "next/server";
import { getStoredApiKeyByEmail } from "@/lib/api/key-store";
import { getStripe } from "@/lib/stripe/client";
import {
  siteUrl,
  stripeBillingPortalConfiguration,
} from "@/lib/stripe/config";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe billing is not configured." },
      { status: 503 },
    );
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const stored = await getStoredApiKeyByEmail(email);
  if (!stored?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No active subscription found for that email." },
      { status: 404 },
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: stored.stripeCustomerId,
      return_url: `${siteUrl()}/developers`,
      ...(stripeBillingPortalConfiguration()
        ? { configuration: stripeBillingPortalConfiguration()! }
        : {}),
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("[stripe/portal]", error);
    return NextResponse.json(
      { error: "Could not open billing portal." },
      { status: 502 },
    );
  }
}
