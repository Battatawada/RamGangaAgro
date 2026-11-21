import type { NextRequest } from "next/server";
import type Stripe from "stripe";
import {
  findOrderIdForSession,
  fulfillPaidOrder,
  markPaymentFailed,
} from "@/server/commerce/fulfill-payment";
import { sendOrderConfirmation } from "@/server/orders";
import { constructStripeEvent } from "@/server/payments/stripe";
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(rawBody, signature);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const eventId = event.id;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        return new Response(null, { status: 200 });
      }
      const orderId =
        session.metadata?.orderId ??
        (session.id ? await findOrderIdForSession(session.id) : null);
      if (!orderId) return new Response(null, { status: 200 });

      const amount = session.amount_total ?? 0;
      const currency = session.currency ?? "inr";

      const result = await fulfillPaidOrder({
        eventId,
        providerOrderId: session.id,
        providerPaymentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        amountPaise: amount,
        currency,
        orderId,
      });

      if (result.status === "applied") {
        await sendOrderConfirmation(orderId);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata?.orderId;
      if (orderId) await markPaymentFailed(orderId);
    }
  } catch (error) {
    console.error("stripe webhook failed", {
      type: event.type,
      message: error instanceof Error ? error.message : "unknown",
    });
    return new Response(null, { status: 500 });
  }

  return new Response(null, { status: 200 });
}