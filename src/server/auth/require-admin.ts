import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";

export type AdminRefusal =
  | "no_session"
  | "no_second_factor"
  | "not_admin"
  | "lookup_failed";

export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; reason: AdminRefusal };

type AuthLike = {
  userId?: string | null;
  factorVerificationAge?: number[] | null;
  sessionClaims?: { fva?: number[] | null } | null;
};

function secondFactorAge(session: AuthLike): number | null {
  const fromAuth = session.factorVerificationAge;
  if (Array.isArray(fromAuth)) return fromAuth[1] ?? null;
  const fromClaims = session.sessionClaims?.fva;
  if (Array.isArray(fromClaims)) return fromClaims[1] ?? null;
  return null;
}

/**
 * The admin gate. Instance-wide "require MFA" is off on purpose, so this
 * function does the work:
 *
 * 1. There has to be a session.
 * 2. A second factor has to be enrolled. A second-factor age of -1 means none
 *    is enrolled, and Clerk quietly downgrades second-factor reverification in
 *    that case, so reverification alone would let a password-only admin in.
 * 3. The role is read live from publicMetadata with the Backend API, because
 *    the session claim can lag by up to a minute.
 * 4. The live user must also have two-factor enabled.
 *
 * Nothing here trusts a value that came from the browser.
 */
export async function requireAdmin(): Promise<AdminCheck> {
  const session = (await auth()) as AuthLike;
  const userId = session.userId;
  if (!userId) return { ok: false, reason: "no_session" };

  const factorAge = secondFactorAge(session);
  if (factorAge === null || factorAge === -1) {
    return { ok: false, reason: "no_second_factor" };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata as { role?: unknown } | null)?.role;
    if (role !== "admin") return { ok: false, reason: "not_admin" };
    if (user.twoFactorEnabled !== true) {
      return { ok: false, reason: "no_second_factor" };
    }
    return { ok: true, userId };
  } catch {
    // A failed lookup fails closed.
    return { ok: false, reason: "lookup_failed" };
  }
}
