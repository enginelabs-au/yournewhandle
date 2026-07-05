import Stripe from "stripe";
import { stripeSecretKey } from "@/lib/stripe/config";

let stripeClient: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (stripeClient !== undefined) {
    return stripeClient;
  }

  const secret = stripeSecretKey();
  if (!secret) {
    stripeClient = null;
    return stripeClient;
  }

  stripeClient = new Stripe(secret);

  return stripeClient;
}
