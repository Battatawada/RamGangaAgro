import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { formatPaise } from "@/lib/money";
import { sendTransactionalEmail } from "./mail";
import { clearCart, readCart } from "./cart-cookie";
import { resolveCartLines } from "./catalog";
import { getDb } from "./db";
import {
  orderAccessTokens,
  orderAddresses,
  orderItems,
  orders,
  users,
} from "./db/schema";
import { createCheckoutSession } from "./payments/stripe";
import { isEnabled } from "./flags";
import {
  DEFAULT_SHIPPING_PAISE,
  parcelMixAllowed,
  pinServicesOrder,
} from "./shipping";

export type CheckoutInput = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getOrdersForUser(clerkUserId: string) {
  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  if (!user) return [];

  return getDb()
    .select({
      id: orders.id,
      status: orders.status,
      totalPaise: orders.totalPaise,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderForUser(orderId: string, clerkUserId: string) {
  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  if (!user) return null;

  const [order] = await getDb()
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
    .limit(1);
  return order ?? null;
}

export async function getOrderByAccessToken(token: string) {
  const tokenHash = hashToken(token);
  const [row] = await getDb()
    .select({ orderId: orderAccessTokens.orderId })
    .from(orderAccessTokens)
    .where(eq(orderAccessTokens.tokenHash, tokenHash))
    .limit(1);
  if (!row) return null;

  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.id, row.orderId))
    .limit(1);
  return order ?? null;
}

export async function placeOrder(input: CheckoutInput): Promise<
  | { ok: true; checkoutUrl: string }
  | { ok: true; orderId: string; pending: true }
  | { ok: false; message: string }
> {
  if (!isEnabled("CHECKOUT_ENABLED")) {
    return { ok: false, message: "Checkout is not open." };
  }

  const cart = await readCart();
  const resolved = await resolveCartLines(cart);
  if (!resolved.ok) return { ok: false, message: resolved.message };

  const mixError = parcelMixAllowed(resolved.shippingClasses);
  if (mixError) return { ok: false, message: mixError };

  if (!pinServicesOrder(input.postalCode)) {
    return {
      ok: false,
      message: "That PIN is outside our delivery area. Write to us on the contact page.",
    };
  }

  const itemsSubtotal = resolved.items.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0,
  );
  const shippingPaise = DEFAULT_SHIPPING_PAISE;
  const totalPaise = itemsSubtotal + shippingPaise;

  let userId: string | null = null;
  const session = await auth();
  if (session.userId) {
    const [user] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, session.userId))
      .limit(1);
    userId = user?.id ?? null;
  }

  const guestToken = randomBytes(24).toString("base64url");
  const tokenHash = hashToken(guestToken);

  const orderId = await getDb().transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        email: input.email,
        status: "pending_payment",
        totalPaise,
        shippingPaise,
        currency: "INR",
      })
      .returning({ id: orders.id });

    await tx.insert(orderAddresses).values({
      orderId: order.id,
      name: input.name,
      line1: input.line1,
      line2: input.line2 ?? null,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      country: "IN",
      phone: input.phone,
    });

    await tx.insert(orderItems).values(
      resolved.items.map((item) => ({
        orderId: order.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPricePaise: item.unitPricePaise,
      })),
    );

    if (!userId) {
      await tx.insert(orderAccessTokens).values({
        orderId: order.id,
        tokenHash,
      });
    }

    return order.id;
  });

  await clearCart();

  if (!isEnabled("PAYMENTS_ENABLED")) {
    return { ok: true, orderId, pending: true };
  }

  try {
    const session = await createCheckoutSession({
      orderId,
      customerEmail: input.email,
      shippingPaise,
      lines: resolved.items.map((item) => ({
        name: `${item.productName} — ${item.name}`,
        unitAmountPaise: item.unitPricePaise,
        quantity: item.quantity,
      })),
    });

    await getDb()
      .update(orders)
      .set({
        provider: "stripe",
        providerOrderId: session.sessionId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return { ok: true, checkoutUrl: session.url };
  } catch {
    return { ok: false, message: "Payment could not be started. Try again later." };
  }
}

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const [order] = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order?.email) return;

  const items = await getDb()
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const lines = items.map(
    (item) => `• ${item.quantity} × pack (${formatPaise(item.unitPricePaise)})`,
  );

  const result = await sendTransactionalEmail({
    to: order.email,
    subject: `Order ${orderId} — Ram Ganga Agro`,
    text: [
      "Thank you. Payment for this order is confirmed.",
      "",
      `Order: ${orderId}`,
      `Total: ${formatPaise(order.totalPaise)}`,
      "",
      ...lines,
      "",
      "Ram Ganga Agro",
      "https://rgagro.me",
    ].join("\n"),
  });

  if (!result.sent) {
    console.info("order confirmation skipped", { orderId: orderId.slice(0, 8) });
  }
}