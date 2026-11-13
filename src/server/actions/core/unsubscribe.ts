import { unsubscribeEmail } from "@/server/db/repositories";
import { getRateLimiter } from "@/server/rate-limit";
import { bucketsFor } from "@/server/rate-limit-policy";
import { unsubscribeSchema } from "@/server/validation";
import { messages, type ActionResult } from "../result";

/**
 * One sentence, always, once the request is allowed. A listed address, an
 * address that was never stored, a second request for an address already
 * removed, a different capitalisation and a padded address all get the same
 * answer, with no field errors and no extra detail to compare.
 *
 * A missing limiter or a store error is a refusal for every address. It must
 * not skip the check and still return the success sentence.
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
    return { ok: false, message: messages.unsubscribeTooMany };
  }

  try {
    for (const bucket of bucketsFor("unsubscribe", context.ip)) {
      if (!(await limiter.check(bucket.key, bucket.limit, bucket.windowSeconds))) {
        return { ok: false, message: messages.unsubscribeTooMany };
      }
    }
  } catch {
    return { ok: false, message: messages.unsubscribeTooMany };
  }

  try {
    if (parsed.success) {
      await unsubscribeEmail(parsed.data.email);
    }
  } catch {
    // A storage failure is not reported either, because the wording would
    // differ between a listed and an unlisted address.
  }

  return { ok: true, message: messages.unsubscribeDone };
}
