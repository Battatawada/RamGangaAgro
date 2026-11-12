import { applyClerkEventOnce, type ClerkUserUpsert } from "@/server/db/repositories";

/** Only these two values are accepted. Anything else is stored as customer. */
function normaliseRole(value: unknown): "customer" | "admin" {
  return value === "admin" ? "admin" : "customer";
}

type ClerkEmail = { id?: string; email_address?: string };

type ClerkUserData = {
  id?: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  public_metadata?: Record<string, unknown> | null;
  /** Present on the payload, and never read for a decision. */
  unsafe_metadata?: Record<string, unknown> | null;
};

export type ClerkEvent = {
  type?: string;
  data?: ClerkUserData;
};

export function mapClerkUser(data: ClerkUserData): ClerkUserUpsert | null {
  if (!data.id) return null;

  const primary =
    data.email_addresses?.find(
      (address) => address.id === data.primary_email_address_id,
    ) ?? data.email_addresses?.[0];

  return {
    clerkUserId: data.id,
    email: primary?.email_address ?? null,
    name: [data.first_name, data.last_name].filter(Boolean).join(" ") || null,
    // publicMetadata is the only role authority. unsafe_metadata is ignored.
    role: normaliseRole(data.public_metadata?.role),
  };
}

export type WebhookOutcome =
  | { status: 200; applied: boolean }
  | { status: 400 }
  | { status: 500 };

/**
 * Applies a verified event. The caller has already checked the signature.
 * The database work and the (provider, event_id) row commit together, so a
 * retry of the same event changes nothing and still answers 200.
 */
export async function handleClerkEvent(
  eventId: string,
  event: ClerkEvent,
): Promise<WebhookOutcome> {
  if (!eventId) return { status: 400 };

  const type = event.type ?? "";
  if (!type.startsWith("user.")) {
    // Nothing to apply, but the event was accepted.
    return { status: 200, applied: false };
  }

  const user = event.data ? mapClerkUser(event.data) : null;
  if (!user) return { status: 400 };

  const effect = type === "user.deleted" ? "delete" : "upsert";
  const { applied } = await applyClerkEventOnce(eventId, effect, user);
  return { status: 200, applied };
}
