import "server-only";
import { parseTransactionalSender } from "@/lib/email-sender";

type SendInput = {
  to: string;
  subject: string;
  text: string;
};

export type SendResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "provider_error" };

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Transactional mail via Brevo when BREVO_API_KEY and TRANSACTIONAL_FROM_EMAIL
 * are set. Otherwise the send is skipped so forms still work in development.
 */
export async function sendTransactionalEmail(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const fromRaw = process.env.TRANSACTIONAL_FROM_EMAIL?.trim();
  const sender = fromRaw ? parseTransactionalSender(fromRaw) : null;

  if (!apiKey || !sender) {
    return { sent: false, reason: "not_configured" };
  }

  const replyRaw = process.env.TRANSACTIONAL_REPLY_TO?.trim();
  const replyTo = replyRaw ? parseTransactionalSender(replyRaw) : null;

  const body: Record<string, unknown> = {
    sender,
    to: [{ email: input.to.trim() }],
    subject: input.subject,
    textContent: input.text,
  };

  if (replyTo) {
    body.replyTo = replyTo;
  }

  try {
    const response = await fetch(BREVO_SEND_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Transactional email refused.", { status: response.status });
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Transactional email failed.",
    );
    return { sent: false, reason: "provider_error" };
  }
}

export function contactAutoReplyCopy(): { subject: string; text: string } {
  return {
    subject: "We received your note — Ram Ganga Agro",
    text: [
      "Thank you for writing to Ram Ganga Agro.",
      "",
      "Your message is stored for the farm to read. This is an automatic confirmation, not a personal reply.",
      "",
      "Ram Ganga Agro",
      "https://rgagro.me",
    ].join("\n"),
  };
}