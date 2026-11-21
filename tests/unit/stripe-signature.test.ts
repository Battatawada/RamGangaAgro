import { describe, expect, it } from "vitest";

describe("stripe webhook verification", () => {
  it("rejects when the webhook secret is missing", async () => {
    const { constructStripeEvent } = await import("@/server/payments/stripe");
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(() => constructStripeEvent("{}", null)).toThrow(/STRIPE_WEBHOOK_SECRET/);
  });
});