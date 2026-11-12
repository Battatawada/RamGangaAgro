import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeStore } from "../helpers/fake-store";

const store = createFakeStore();

vi.mock("@/server/db/repositories", () => ({
  subscribeEmail: (input: { email: string; source: string; tokenHash: string }) =>
    store.subscribeEmail(input),
}));

const { submitNewsletter } = await import("@/server/actions/core/newsletter");
const { createMemoryLimiter, setRateLimiterForTests } = await import(
  "@/server/rate-limit"
);

const valid = {
  email: "reader@example.com",
  consent: "on",
  source: "homepage",
  company: "",
};

describe("newsletter action", () => {
  beforeEach(() => {
    store.reset();
    setRateLimiterForTests(createMemoryLimiter());
  });

  it("stores a lowercased address with a consent time and a token hash", async () => {
    const result = await submitNewsletter(
      { ...valid, email: "  Reader@Example.COM " },
      { ip: "10.0.1.1" },
    );
    expect(result.ok).toBe(true);

    const row = store.subscribers.get("reader@example.com");
    expect(row).toBeDefined();
    expect(row?.consentAt).toBeInstanceOf(Date);
    expect(row?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(row?.source).toBe("homepage");
  });

  it("rejects a missing checkbox", async () => {
    const result = await submitNewsletter(
      { email: valid.email, source: "homepage", company: "" },
      { ip: "10.0.1.2" },
    );
    expect(result.ok).toBe(false);
    expect(store.subscribers.size).toBe(0);
  });

  it("rejects a filled honeypot", async () => {
    const result = await submitNewsletter(
      { ...valid, company: "A crawler" },
      { ip: "10.0.1.3" },
    );
    expect(result.ok).toBe(false);
    expect(store.subscribers.size).toBe(0);
  });

  it("does not create a second row for an address already on the list", async () => {
    await submitNewsletter(valid, { ip: "10.0.1.4" });
    await submitNewsletter(valid, { ip: "10.0.1.4" });
    expect(store.subscribers.size).toBe(1);
  });

  it("reinstates an address that had been removed", async () => {
    await submitNewsletter(valid, { ip: "10.0.1.5" });
    await store.unsubscribeEmail("reader@example.com");
    expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).not.toBeNull();

    await submitNewsletter(valid, { ip: "10.0.1.5" });
    expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).toBeNull();
  });

  it("refuses the sixth signup from one address in an hour", async () => {
    const ip = "10.0.1.6";
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const result = await submitNewsletter(
        { ...valid, email: `reader${attempt}@example.com` },
        { ip },
      );
      expect(result.ok).toBe(true);
    }
    const sixth = await submitNewsletter(
      { ...valid, email: "reader6@example.com" },
      { ip },
    );
    expect(sixth.ok).toBe(false);
  });
});
