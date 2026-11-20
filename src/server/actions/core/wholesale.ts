import type { z } from "zod";
import { insertContactMessage } from "@/server/db/repositories";
import { contactAutoReplyCopy, sendTransactionalEmail } from "@/server/mail";
import { getRateLimiter } from "@/server/rate-limit";
import { bucketsFor } from "@/server/rate-limit-policy";
import { wholesaleSchema } from "@/server/validation";
import { fieldErrorsFrom, messages, type ActionResult } from "../result";

function formatWholesaleMessage(data: z.infer<typeof wholesaleSchema>): string {
  return [
    "[Wholesale enquiry]",
    `Product: ${data.product}`,
    `Quantity (kg): ${data.quantityKg}`,
    `Destination: ${data.destination}`,
    `Company: ${data.company}`,
    `Phone: ${data.phone}`,
    `GSTIN: ${data.gstin}`,
    `Sample requested: ${data.sample === "on" ? "yes" : "no"}`,
  ].join("\n");
}

export async function submitWholesale(
  input: unknown,
  context: { ip: string },
): Promise<ActionResult> {
  const parsed = wholesaleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: messages.contactFailed,
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const limiter = getRateLimiter();
    for (const bucket of bucketsFor("contact", context.ip)) {
      if (!(await limiter.check(bucket.key, bucket.limit, bucket.windowSeconds))) {
        return { ok: false, message: messages.contactTooMany };
      }
    }

    await insertContactMessage({
      name: data.name,
      email: data.email,
      message: formatWholesaleMessage(data),
    });

    const confirmation = contactAutoReplyCopy();
    await sendTransactionalEmail({
      to: data.email,
      subject: confirmation.subject,
      text: [
        confirmation.text,
        "",
        "Your wholesale enquiry was stored for the farm to review.",
      ].join("\n"),
    });
  } catch {
    return { ok: false, message: messages.contactFailed };
  }

  return { ok: true };
}