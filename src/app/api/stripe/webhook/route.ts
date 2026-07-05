import { NextResponse } from "next/server";
import Stripe from "stripe";
import { deactivateApiKeyBySubscription, subscriptionHasApiKey } from "@/lib/api/key-store";
import { getStripe } from "@/lib/stripe/client";
import {
  provisionApiKeyFromCheckoutSession,
  provisionApiKeyFromSubscription,
} from "@/lib/stripe/provision";
import { stripeWebhookSecret } from "@/lib/stripe/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = stripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          let hydrated = session;
          if (!session.subscription || typeof session.subscription === "string") {
            hydrated = await stripe.checkout.sessions.retrieve(session.id, {
              expand: ["subscription"],
            });
          }

          const subscriptionId =
            typeof hydrated.subscription === "string"
              ? hydrated.subscription
              : hydrated.subscription?.id;

          if (!subscriptionId || !(await subscriptionHasApiKey(subscriptionId))) {
            await provisionApiKeyFromCheckoutSession(hydrated);
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        if (
          subscription.metadata?.plan &&
          !(await subscriptionHasApiKey(subscription.id))
        ) {
          await provisionApiKeyFromSubscription(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await deactivateApiKeyBySubscription(subscription.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        if (
          subscription.status === "canceled" ||
          subscription.status === "unpaid" ||
          subscription.status === "incomplete_expired"
        ) {
          await deactivateApiKeyBySubscription(subscription.id);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[stripe/webhook] handler error:", event.type, error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
