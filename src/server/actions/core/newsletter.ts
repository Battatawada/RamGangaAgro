import { createHash, randomBytes } from "node:crypto";
import { subscribeEmail } from "@/server/db/repositories";
import { getRateLimiter } from "@/server/rate-limit";
import { newsletterSchema } from "@/server/validation";
import { fieldErrorsFrom, messages, type ActionResult } from "../result";

const HOUR = 60 * 60;
const PER_IP = 5;

/**
 * The token is stored as a hash so a later one-click unsubscribe link has
 * something to match. Phase 1 sends no mail and never shows the token.
 */
function newTokenHash(): string {
  return createHash("sha256").update(randomBytes(32)).digest("hex");
}

export async function submitNewsletter(
  input: unknown,
  context: { ip: string },
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: messages.newsletterFailed,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { email, source } = parsed.data;

  try {
    const limiter = getRateLimiter();
    if (!(await limiter.check(`newsletter:ip:${context.ip}`, PER_IP, HOUR))) {
      return { ok: false, message: messages.newsletterTooMany };
    }

    await subscribeEmail({ email, source, tokenHash: newTokenHash() });
  } catch {
    return { ok: false, message: messages.newsletterFailed };
  }

  return { ok: true };
}
