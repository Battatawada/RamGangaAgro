import "server-only";
import Stripe from "stripe";
import { resolveSiteUrl } from "@/content/site";

function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(key);
}

export type CheckoutLine = {
  name: string;
  unitAmountPaise: number;
  quantity: number;
};

export async function createCheckoutSession(input: {
  orderId: string;
  customerEmail: string;
  lines: CheckoutLine[];
  shippingPaise: number;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = client();
  const origin = resolveSiteUrl(process.env.SITE_URL);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    input.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "inr",
        unit_amount: line.unitAmountPaise,
        product_data: { name: line.name },
      },
    }));

  if (input.shippingPaise > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "inr",
        unit_amount: input.shippingPaise,
        product_data: { name: "Shipping" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: lineItems,
    metadata: { orderId: input.orderId },
    success_url: `${origin}/checkout/success?order=${input.orderId}`,
    cancel_url: `${origin}/checkout/cancel?order=${input.orderId}`,
    shipping_address_collection: { allowed_countries: ["IN"] },
    phone_number_collection: { enabled: true },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return { url: session.url, sessionId: session.id };
}

export function constructStripeEvent(
  rawBody: string,
  signature: string | null,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
  }
  if (!signature) {
    throw new Error("Missing Stripe signature.");
  }
  return Stripe.webhooks.constructEvent(rawBody, signature, secret);
}