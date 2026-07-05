import type Stripe from "stripe";

export type CheckoutLineItem = {
  price: string;
  quantity?: number;
};

export async function buildCheckoutLineItems(
  stripe: Stripe,
  plan: "starter" | "pro" | "enterprise",
  priceId: string,
  enterpriseBasePriceId: string | null,
): Promise<CheckoutLineItem[]> {
  if (plan !== "enterprise") {
    return [{ price: priceId, quantity: 1 }];
  }

  const usagePrice = await stripe.prices.retrieve(priceId);
  if (usagePrice.recurring?.usage_type !== "metered") {
    return [{ price: priceId, quantity: 1 }];
  }

  if (!enterpriseBasePriceId) {
    return [{ price: priceId }];
  }

  return [
    { price: enterpriseBasePriceId, quantity: 1 },
    { price: priceId },
  ];
}
