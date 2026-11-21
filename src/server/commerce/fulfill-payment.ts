import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import {
  auditLog,
  inventory,
  orderItems,
  orders,
  webhookEvents,
} from "@/server/db/schema";

export type FulfillInput = {
  eventId: string;
  providerOrderId: string;
  providerPaymentId: string | null;
  amountPaise: number;
  currency: string;
  orderId: string;
};

export type FulfillResult =
  | { status: "applied" | "duplicate" | "mismatch" | "not_pending" }
  | { status: "error"; message: string };

export async function fulfillPaidOrder(
  input: FulfillInput,
): Promise<FulfillResult> {
  return getDb().transaction(async (tx) => {
    const recorded = await tx
      .insert(webhookEvents)
      .values({ provider: "stripe", eventId: input.eventId })
      .onConflictDoNothing()
      .returning({ eventId: webhookEvents.eventId });

    if (recorded.length === 0) {
      return { status: "duplicate" as const };
    }

    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, input.orderId))
      .for("update")
      .limit(1);

    if (!order) {
      return { status: "error", message: "Order not found." };
    }

    if (order.status !== "pending_payment") {
      return { status: "not_pending" as const };
    }

    const expectedTotal = order.totalPaise;
    if (
      input.amountPaise !== expectedTotal ||
      input.currency.toLowerCase() !== order.currency.toLowerCase()
    ) {
      await tx
        .update(orders)
        .set({ status: "review", updatedAt: new Date() })
        .where(eq(orders.id, order.id));
      await tx.insert(auditLog).values({
        action: "order.payment_mismatch",
        targetType: "order",
        targetId: order.id,
        note: {
          expectedPaise: expectedTotal,
          receivedPaise: input.amountPaise,
          currency: input.currency,
        },
      });
      return { status: "mismatch" as const };
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    for (const item of items) {
      const [stock] = await tx
        .select({ quantity: inventory.quantity })
        .from(inventory)
        .where(eq(inventory.variantId, item.variantId))
        .for("update")
        .limit(1);
      const available = stock?.quantity ?? 0;
      if (available < item.quantity) {
        await tx
          .update(orders)
          .set({ status: "review", updatedAt: new Date() })
          .where(eq(orders.id, order.id));
        await tx.insert(auditLog).values({
          action: "order.inventory_short",
          targetType: "order",
          targetId: order.id,
        });
        return { status: "mismatch" as const };
      }
      await tx
        .update(inventory)
        .set({ quantity: sql`${inventory.quantity} - ${item.quantity}` })
        .where(eq(inventory.variantId, item.variantId));
    }

    await tx
      .update(orders)
      .set({
        status: "paid",
        provider: "stripe",
        providerOrderId: input.providerOrderId,
        providerPaymentId: input.providerPaymentId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    return { status: "applied" as const };
  });
}

export async function markPaymentFailed(orderId: string): Promise<void> {
  await getDb()
    .update(orders)
    .set({ status: "payment_failed", updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")));
}

export async function findOrderIdForSession(
  sessionId: string,
): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.providerOrderId, sessionId))
    .limit(1);
  return row?.id ?? null;
}