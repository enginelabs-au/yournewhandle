import { getStripe } from "@/lib/stripe/client";
import { stripeMeterEventName } from "@/lib/stripe/config";

export async function reportApiMeterEvent(
  stripeCustomerId: string,
  value = 1,
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    return;
  }

  try {
    await stripe.billing.meterEvents.create({
      event_name: stripeMeterEventName(),
      payload: {
        stripe_customer_id: stripeCustomerId,
        value: String(value),
      },
    });
  } catch (error) {
    console.error("[meter-usage] failed to report usage:", error);
  }
}
