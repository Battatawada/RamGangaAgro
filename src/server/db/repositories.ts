import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "./index";
import {
  auditLog,
  contactMessages,
  subscribers,
  users,
  webhookEvents,
} from "./schema";

export async function insertContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  // INSERT only. The app role has no SELECT grant on this table.
  await getDb().insert(contactMessages).values(input);
}

/**
 * A repeat signup for a live address changes nothing and reports nothing.
 * A removed address that signs up again is reinstated with a new consent time.
 */
export async function subscribeEmail(input: {
  email: string;
  source: string;
  tokenHash: string;
}): Promise<void> {
  const now = new Date();
  await getDb()
    .insert(subscribers)
    .values({
      email: input.email,
      source: input.source,
      tokenHash: input.tokenHash,
      consentAt: now,
    })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: { unsubscribedAt: null, consentAt: now },
      where: sql`${subscribers.unsubscribedAt} is not null`,
    });
}

/**
 * Sets unsubscribed_at when the address is listed and still active. The caller
 * never learns which case happened: this function returns nothing.
 */
export async function unsubscribeEmail(email: string): Promise<void> {
  await getDb()
    .update(subscribers)
    .set({ unsubscribedAt: new Date() })
    .where(and(eq(subscribers.email, email), isNull(subscribers.unsubscribedAt)));
}

export type UserRow = {
  id: string;
  clerkUserId: string;
  role: "customer" | "admin";
};

export async function findUserByClerkId(
  clerkUserId: string,
): Promise<UserRow | null> {
  const rows = await getDb()
    .select({
      id: users.id,
      clerkUserId: users.clerkUserId,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.clerkUserId, clerkUserId), isNull(users.deletedAt)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { ...row, role: row.role === "admin" ? "admin" : "customer" };
}

export async function insertUserRow(input: {
  clerkUserId: string;
  email: string | null;
  name: string | null;
  role: "customer" | "admin";
}): Promise<UserRow> {
  const [row] = await getDb()
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { updatedAt: new Date() },
    })
    .returning({
      id: users.id,
      clerkUserId: users.clerkUserId,
      role: users.role,
    });

  return { ...row, role: row.role === "admin" ? "admin" : "customer" };
}

export type ClerkUserUpsert = {
  clerkUserId: string;
  email: string | null;
  name: string | null;
  role: "customer" | "admin";
};

/**
 * Records the event and applies its effect in one transaction. A duplicate
 * (provider, event_id) means the work was already done, so nothing is applied
 * and the caller still returns 200.
 */
export async function applyClerkEventOnce(
  eventId: string,
  effect: "upsert" | "delete",
  user: ClerkUserUpsert,
): Promise<{ applied: boolean }> {
  return getDb().transaction(async (tx) => {
    const recorded = await tx
      .insert(webhookEvents)
      .values({ provider: "clerk", eventId })
      .onConflictDoNothing()
      .returning({ eventId: webhookEvents.eventId });

    if (recorded.length === 0) {
      return { applied: false };
    }

    if (effect === "delete") {
      await tx
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.clerkUserId, user.clerkUserId));
    } else {
      await tx
        .insert(users)
        .values({
          clerkUserId: user.clerkUserId,
          email: user.email,
          name: user.name,
          role: user.role,
        })
        .onConflictDoUpdate({
          target: users.clerkUserId,
          set: {
            email: user.email,
            name: user.name,
            role: user.role,
            updatedAt: new Date(),
          },
          // A delete that already landed is not undone by a late update.
          where: isNull(users.deletedAt),
        });
    }

    await tx.insert(auditLog).values({
      actorClerkUserId: null,
      action: effect === "delete" ? "user.deleted" : "user.upserted",
      targetType: "user",
      targetId: user.clerkUserId,
      note: { source: "clerk.webhook", eventId },
    });

    return { applied: true };
  });
}
