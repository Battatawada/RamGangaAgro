import { unsubscribeEmail } from "@/server/db/repositories";
import { getRateLimiter } from "@/server/rate-limit";
import { unsubscribeSchema } from "@/server/validation";
import { messages, type ActionResult } from "../result";

const HOUR = 60 * 60;
const PER_IP = 5;

/**
 * One sentence, always. A listed address, an address that was never stored, a
 * second request for an address already removed, a different capitalisation
 * and a padded address all get the same answer, with no field errors and no
 * extra detail to compare.
 */
export async function submitUnsubscribe(
  input: unknown,
  context: { ip: string },
): Promise<ActionResult> {
  const parsed = unsubscribeSchema.safeParse(input);

  let limiter;
  try {
    limiter = getRateLimiter();
  } catch {
    // The limiter is required outside tests. Missing configuration must not
    // skip the delete and still return the success sentence.
    return { ok: false, message: messages.unsubscribeTooMany };
  }

  try {
    if (!(await limiter.check(`unsubscribe:ip:${context.ip}`, PER_IP, HOUR))) {
      return { ok: false, message: messages.unsubscribeTooMany };
    }

    if (parsed.success) {
      await unsubscribeEmail(parsed.data.email);
    }
  } catch {
    // A storage failure is not reported either, because the wording would
    // differ between a listed and an unlisted address.
  }

  return { ok: true, message: messages.unsubscribeDone };
}
