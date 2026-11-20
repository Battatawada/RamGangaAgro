import "server-only";

type SendInput = {
  to: string;
  subject: string;
  text: string;
};

export type SendResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "provider_error" };

/**
 * Transactional mail via Resend when RESEND_API_KEY and TRANSACTIONAL_FROM_EMAIL
 * are set. Otherwise the send is skipped so forms still work in development.
 */
export async function sendTransactionalEmail(input: SendInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.TRANSACTIONAL_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
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