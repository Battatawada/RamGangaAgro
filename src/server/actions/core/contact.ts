import { insertContactMessage } from "@/server/db/repositories";
import { getRateLimiter } from "@/server/rate-limit";
import { bucketsFor } from "@/server/rate-limit-policy";
import { contactSchema } from "@/server/validation";
import { fieldErrorsFrom, messages, type ActionResult } from "../result";

export async function submitContact(
  input: unknown,
  context: { ip: string },
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: messages.contactFailed,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { name, email, message } = parsed.data;

  try {
    const limiter = getRateLimiter();
    for (const bucket of bucketsFor("contact", context.ip)) {
      if (!(await limiter.check(bucket.key, bucket.limit, bucket.windowSeconds))) {
        return { ok: false, message: messages.contactTooMany };
      }
    }

    await insertContactMessage({ name, email, message });
  } catch {
    // The detail goes to the server log, not to the visitor.
    return { ok: false, message: messages.contactFailed };
  }

  return { ok: true };
}
