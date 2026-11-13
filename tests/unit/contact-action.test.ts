import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeStore } from "../helpers/fake-store";

const store = createFakeStore();

vi.mock("@/server/db/repositories", () => ({
  insertContactMessage: (input: { name: string; email: string; message: string }) =>
    store.insertContactMessage(input),
}));

const { submitContact } = await import("@/server/actions/core/contact");
const { createMemoryLimiter, setRateLimiterForTests } = await import(
  "@/server/rate-limit"
);
const { messages } = await import("@/server/actions/result");

const valid = {
  name: "A Reader",
  email: "reader@example.com",
  message: "I would like to hear about the harvest when there is one.",
  company: "",
};

describe("contact action", () => {
  beforeEach(() => {
    store.reset();
    setRateLimiterForTests(createMemoryLimiter());
  });

  it("accepts a complete note", async () => {
    const result = await submitContact(valid, { ip: "10.0.0.1" });
    expect(result.ok).toBe(true);
    expect(store.contactMessages).toHaveLength(1);
  });

  it("rejects an empty message", async () => {
    const result = await submitContact({ ...valid, message: "" }, { ip: "10.0.0.2" });
    expect(result.ok).toBe(false);
    expect(store.contactMessages).toHaveLength(0);
  });

  it("rejects a missing email", async () => {
    const result = await submitContact({ ...valid, email: "" }, { ip: "10.0.0.3" });
    expect(result.ok).toBe(false);
    expect(store.contactMessages).toHaveLength(0);
  });

  it("rejects an overlong message", async () => {
    const result = await submitContact(
      { ...valid, message: "x".repeat(2001) },
      { ip: "10.0.0.4" },
    );
    expect(result.ok).toBe(false);
    expect(store.contactMessages).toHaveLength(0);
  });

  it("rejects a filled honeypot", async () => {
    const result = await submitContact(
      { ...valid, company: "A crawler" },
      { ip: "10.0.0.5" },
    );
    expect(result.ok).toBe(false);
    expect(store.contactMessages).toHaveLength(0);
  });

  it("rejects an unexpected field, because the schema is strict", async () => {
    const result = await submitContact(
      { ...valid, role: "admin" },
      { ip: "10.0.0.6" },
    );
    expect(result.ok).toBe(false);
  });

  it("refuses the sixth note from one address in an hour", async () => {
    const ip = "10.0.0.7";
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const result = await submitContact(
        { ...valid, email: `reader${attempt}@example.com` },
        { ip },
      );
      expect(result.ok).toBe(true);
    }

    const sixth = await submitContact(
      { ...valid, email: "reader6@example.com" },
      { ip },
    );
    expect(sixth.ok).toBe(false);
    expect(sixth.ok === false && sixth.message).toBe(messages.contactTooMany);
    expect(store.contactMessages).toHaveLength(5);
  });

  it("does not treat the email address as a rate-limit identifier", async () => {
    const seen: string[] = [];
    setRateLimiterForTests({
      async check(key) {
        seen.push(key);
        return true;
      },
    });

    const result = await submitContact(valid, { ip: "192.0.2.10" });
    expect(result.ok).toBe(true);
    expect(seen).toEqual(["contact:ip:192.0.2.10", "contact:all"]);
    expect(seen.some((key) => key.includes("@") || key.includes("example.com"))).toBe(
      false,
    );
  });

  it("allows the same email from different addresses", async () => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const result = await submitContact(valid, { ip: `192.0.2.${attempt}` });
      expect(result.ok).toBe(true);
    }
    expect(store.contactMessages).toHaveLength(4);
  });

  it("refuses the write when the limiter cannot be constructed", async () => {
    setRateLimiterForTests(undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("RATE_LIMIT_PROVIDER", "");

    try {
      const result = await submitContact(valid, { ip: "192.0.2.20" });
      expect(result.ok).toBe(false);
      expect(result.ok === false && result.message).toBe(messages.contactFailed);
      expect(store.contactMessages).toHaveLength(0);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
