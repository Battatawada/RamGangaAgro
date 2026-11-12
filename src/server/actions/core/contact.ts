import { insertContactMessage } from "@/server/db/repositories";
import { getRateLimiter } from "@/server/rate-limit";
import { contactSchema } from "@/server/validation";
import { fieldErrorsFrom, messages, type ActionResult } from "../result";

const HOUR = 60 * 60;
const PER_IP = 5;
const PER_EMAIL = 3;

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
    if (!(await limiter.check(`contact:ip:${context.ip}`, PER_IP, HOUR))) {
      return { ok: false, message: messages.contactTooMany };
    }
    if (!(await limiter.check(`contact:email:${email}`, PER_EMAIL, HOUR))) {
      return { ok: false, message: messages.contactTooMany };
    }

    await insertContactMessage({ name, email, message });
  } catch {
    // The detail goes to the server log, not to the visitor.
    return { ok: false, message: messages.contactFailed };
  }

  return { ok: true };
}
