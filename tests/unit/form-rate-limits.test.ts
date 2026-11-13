import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeStore } from "../helpers/fake-store";
import { operationLimits } from "@/server/rate-limit-policy";

const store = createFakeStore();

vi.mock("@/server/db/repositories", () => ({
  insertContactMessage: (input: { name: string; email: string; message: string }) =>
    store.insertContactMessage(input),
  subscribeEmail: (input: { email: string; source: string; tokenHash: string }) =>
    store.subscribeEmail(input),
  unsubscribeEmail: (email: string) => store.unsubscribeEmail(email),
}));

const { submitContact } = await import("@/server/actions/core/contact");
const { submitNewsletter } = await import("@/server/actions/core/newsletter");
const { submitUnsubscribe } = await import("@/server/actions/core/unsubscribe");
const { createMemoryLimiter, setRateLimiterForTests } = await import(
  "@/server/rate-limit"
);

const contact = {
  name: "A Reader",
  email: "reader@example.com",
  message: "I would like to hear about the harvest when there is one.",
  company: "",
};

const newsletter = {
  email: "reader@example.com",
  consent: "on",
  source: "homepage",
  company: "",
};

describe("independent form allowances", () => {
  beforeEach(() => {
    store.reset();
    setRateLimiterForTests(createMemoryLimiter());
  });

  it("still accepts a newsletter and an unsubscribe after the contact allowance is used", async () => {
    const ip = "198.51.100.20";
    for (let attempt = 1; attempt <= operationLimits.contact.perIp; attempt += 1) {
      const result = await submitContact(
        { ...contact, email: `reader${attempt}@example.com` },
        { ip },
      );
      expect(result.ok).toBe(true);
    }

    const blocked = await submitContact(
      { ...contact, email: "blocked@example.com" },
      { ip },
    );
    expect(blocked.ok).toBe(false);

    const subscribed = await submitNewsletter(
      { ...newsletter, email: "follow@example.com" },
      { ip },
    );
    expect(subscribed.ok).toBe(true);

    const removed = await submitUnsubscribe(
      { email: "follow@example.com" },
      { ip },
    );
    expect(removed.ok).toBe(true);
    expect(store.subscribers.get("follow@example.com")?.unsubscribedAt).toBeInstanceOf(
      Date,
    );
  });

  it("stops contact writes for every address once the global allowance is used", async () => {
    const allowance = operationLimits.contact.global;
    for (let attempt = 1; attempt <= allowance; attempt += 1) {
      const result = await submitContact(
        { ...contact, email: `reader${attempt}@example.com` },
        { ip: `198.51.100.${attempt}` },
      );
      expect(result.ok).toBe(true);
    }

    const blocked = await submitContact(
      { ...contact, email: "one-more@example.com" },
      { ip: "203.0.113.50" },
    );
    expect(blocked.ok).toBe(false);
    expect(store.contactMessages).toHaveLength(allowance);
  });
});
