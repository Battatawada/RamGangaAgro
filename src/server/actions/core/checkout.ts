import { getRateLimiter } from "@/server/rate-limit";
import { bucketsFor } from "@/server/rate-limit-policy";
import { placeOrder } from "@/server/orders";
import { checkoutSchema } from "@/server/validation";
import { fieldErrorsFrom, messages, type ActionResult } from "../result";

export async function submitCheckout(
  input: unknown,
  context: { ip: string },
): Promise<ActionResult & { redirectUrl?: string; orderId?: string }> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: messages.checkoutFailed,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  try {
    const limiter = getRateLimiter();
    for (const bucket of bucketsFor("checkout", context.ip)) {
      if (!(await limiter.check(bucket.key, bucket.limit, bucket.windowSeconds))) {
        return { ok: false, message: messages.checkoutTooMany };
      }
    }
  } catch {
    return { ok: false, message: messages.checkoutFailed };
  }

  const outcome = await placeOrder(parsed.data);
  if (!outcome.ok) {
    return { ok: false, message: outcome.message };
  }

  if ("checkoutUrl" in outcome) {
    return { ok: true, redirectUrl: outcome.checkoutUrl };
  }

  return { ok: true, orderId: outcome.orderId, message: messages.checkoutPending };
}