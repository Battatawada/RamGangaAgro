import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeStore } from "../helpers/fake-store";

const store = createFakeStore();

vi.mock("@/server/db/repositories", () => ({
  unsubscribeEmail: (email: string) => store.unsubscribeEmail(email),
  subscribeEmail: (input: { email: string; source: string; tokenHash: string }) =>
    store.subscribeEmail(input),
}));

const { submitUnsubscribe } = await import("@/server/actions/core/unsubscribe");
const { createMemoryLimiter, setRateLimiterForTests } = await import(
  "@/server/rate-limit"
);
const { messages } = await import("@/server/actions/result");

const SENTENCE = "If this address was on the list, it has been removed.";

async function listed(email: string) {
  await store.subscribeEmail({ email, source: "homepage", tokenHash: "x" });
}

describe("unsubscribe action", () => {
  beforeEach(() => {
    store.reset();
    setRateLimiterForTests(createMemoryLimiter());
  });

  it("answers with one sentence for all five cases, and nothing else", async () => {
    await listed("reader@example.com");

    const cases = [
      { label: "listed", input: { email: "reader@example.com" } },
      { label: "never stored", input: { email: "stranger@example.com" } },
      { label: "repeat", input: { email: "reader@example.com" } },
      { label: "different case", input: { email: "READER@example.com" } },
      { label: "padded", input: { email: "  reader@example.com  " } },
    ];

    const seen = new Set<string>();
    for (const testCase of cases) {
      const result = await submitUnsubscribe(testCase.input, {
        ip: `10.0.2.${cases.indexOf(testCase)}`,
      });
      expect(result.ok, testCase.label).toBe(true);
      expect(result.message, testCase.label).toBe(SENTENCE);
      // No field errors, no extra keys to compare between cases.
      expect(Object.keys(result).sort(), testCase.label).toEqual([
        "message",
        "ok",
      ]);
      seen.add(JSON.stringify(result));
    }

    expect(seen.size).toBe(1);
  });

  it("stamps unsubscribed_at on a listed address", async () => {
    await listed("reader@example.com");
    await submitUnsubscribe({ email: "reader@example.com" }, { ip: "10.0.2.9" });
    expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).toBeInstanceOf(
      Date,
    );
  });

  it("matches the trimmed, lowercased form of the stored address", async () => {
    await listed("reader@example.com");
    await submitUnsubscribe({ email: "  READER@Example.com " }, { ip: "10.0.2.10" });
    expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).toBeInstanceOf(
      Date,
    );
  });

  it("leaves an already removed address untouched on a repeat", async () => {
    await listed("reader@example.com");
    await submitUnsubscribe({ email: "reader@example.com" }, { ip: "10.0.2.11" });
    const first = store.subscribers.get("reader@example.com")?.unsubscribedAt;

    await submitUnsubscribe({ email: "reader@example.com" }, { ip: "10.0.2.11" });
    expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).toBe(first);
  });

  it("says the form was used too often without saying whether the address was listed", async () => {
    const ip = "10.0.2.12";
    await listed("reader@example.com");
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await submitUnsubscribe({ email: "reader@example.com" }, { ip });
    }
    const sixth = await submitUnsubscribe({ email: "reader@example.com" }, { ip });
    expect(sixth.ok).toBe(false);
    expect(sixth.ok === false && sixth.message).toBe(messages.unsubscribeTooMany);
    expect(JSON.stringify(sixth)).not.toContain("list");
  });
});
