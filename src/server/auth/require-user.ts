import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { findUserByClerkId, insertUserRow } from "@/server/db/repositories";

export type UserRecord = {
  id: string;
  clerkUserId: string;
  role: "customer" | "admin";
};

/**
 * Resolves the session to a row in our own users table. A row is created only
 * after the Backend API confirms the id, and its role comes from live
 * publicMetadata, never from a claim the browser could shape.
 */
export async function requireUser(): Promise<UserRecord | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await findUserByClerkId(userId);
  if (existing) return existing;

  const client = await clerkClient();
  const live = await client.users.getUser(userId);
  if (!live?.id) return null;

  const role =
    (live.publicMetadata as { role?: unknown } | null)?.role === "admin"
      ? "admin"
      : "customer";

  const email =
    live.emailAddresses?.find((address) => address.id === live.primaryEmailAddressId)
      ?.emailAddress ?? null;

  return insertUserRow({
    clerkUserId: live.id,
    email,
    name: [live.firstName, live.lastName].filter(Boolean).join(" ") || null,
    role,
  });
}
