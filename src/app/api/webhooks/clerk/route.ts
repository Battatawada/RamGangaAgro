import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { handleClerkEvent, type ClerkEvent } from "@/server/webhooks/clerk";

/**
 * Public by design, and untrusted until verifyWebhook() succeeds. It is not
 * behind auth.protect(). The raw payload is never logged.
 */
export async function POST(request: NextRequest) {
  let event: ClerkEvent;

  try {
    event = (await verifyWebhook(request)) as ClerkEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // svix-id is the delivery id, and the idempotency key for this endpoint.
  const eventId = request.headers.get("svix-id") ?? "";

  try {
    const outcome = await handleClerkEvent(eventId, event);
    return new Response(null, { status: outcome.status });
  } catch (error) {
    // A storage failure returns 500 so Clerk retries the delivery.
    console.error("clerk webhook failed", {
      type: event.type,
      message: error instanceof Error ? error.message : "unknown",
    });
    return new Response(null, { status: 500 });
  }
}
