import type Stripe from "stripe";
import type { ApiPlan } from "@/lib/api/plans";
import { storeApiKey } from "@/lib/api/key-store";

function planFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): ApiPlan | null {
  const raw = metadata?.plan?.trim().toLowerCase();
  if (raw === "starter" || raw === "pro" || raw === "enterprise") {
    return raw;
  }
  return null;
}

function customerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | undefined {
  if (!customer) {
    return undefined;
  }
  return typeof customer === "string" ? customer : customer.id;
}

export async function provisionApiKeyFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<{ secret: string; plan: ApiPlan } | null> {
  const plan =
    planFromMetadata(session.metadata) ??
    planFromMetadata(
      typeof session.subscription === "object" && session.subscription
        ? session.subscription.metadata
        : undefined,
    );

  if (!plan) {
    console.error("[stripe] checkout session missing plan metadata", session.id);
    return null;
  }

  const email =
    session.customer_details?.email ??
    session.customer_email ??
    undefined;

  const stripeCustomerId = customerId(session.customer);
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const label = email ?? `Stripe ${plan}`;

  const stored = await storeApiKey({
    plan,
    label,
    email,
    stripeCustomerId,
    stripeSubscriptionId: subscriptionId,
    checkoutSessionId: session.id,
  });

  return { secret: stored.secret, plan: stored.plan };
}

export async function provisionApiKeyFromSubscription(
  subscription: Stripe.Subscription,
): Promise<{ secret: string; plan: ApiPlan } | null> {
  const plan = planFromMetadata(subscription.metadata);
  if (!plan) {
    return null;
  }

  const stripeCustomerId = customerId(subscription.customer);
  const stored = await storeApiKey({
    plan,
    label: stripeCustomerId ? `Stripe ${plan}` : plan,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
  });

  return { secret: stored.secret, plan: stored.plan };
}
