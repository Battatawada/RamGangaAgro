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
const { operationLimits } = await import("@/server/rate-limit-policy");
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

  it("does not claim success when the rate limiter cannot be constructed", async () => {
    setRateLimiterForTests(undefined);
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("RATE_LIMIT_PROVIDER", "");
    vi.stubEnv("RATE_LIMIT_REDIS_URL", "");
    vi.stubEnv("RATE_LIMIT_TOKEN", "");
    await listed("reader@example.com");

    try {
      const result = await submitUnsubscribe(
        { email: "reader@example.com" },
        { ip: "10.0.2.13" },
      );

      expect(result.ok).toBe(false);
      expect(result.ok === false && result.message).toBe(messages.unsubscribeTooMany);
      expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).toBeNull();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("says the form was used too often without saying whether the address was listed", async () => {
    const ip = "10.0.2.12";
    await listed("reader@example.com");
    for (let attempt = 1; attempt <= operationLimits.unsubscribe.perIp; attempt += 1) {
      const result = await submitUnsubscribe(
        { email: attempt % 2 === 0 ? "reader@example.com" : "stranger@example.com" },
        { ip },
      );
      expect(result.ok).toBe(true);
    }
    const blocked = await submitUnsubscribe(
      { email: "reader@example.com" },
      { ip },
    );
    const unknown = await submitUnsubscribe(
      { email: "stranger@example.com" },
      { ip },
    );
    expect(blocked.ok).toBe(false);
    expect(unknown.ok).toBe(false);
    expect(blocked).toEqual(unknown);
    expect(blocked.ok === false && blocked.message).toBe(messages.unsubscribeTooMany);
    expect(JSON.stringify(blocked)).not.toContain("list");
  });

  it("does not claim success when the store fails during the check", async () => {
    setRateLimiterForTests({
      async check() {
        throw new Error("store unavailable");
      },
    });
    await listed("reader@example.com");

    const listedResult = await submitUnsubscribe(
      { email: "reader@example.com" },
      { ip: "10.0.2.20" },
    );
    const unknownResult = await submitUnsubscribe(
      { email: "nobody@example.com" },
      { ip: "10.0.2.21" },
    );

    expect(listedResult).toEqual(unknownResult);
    expect(listedResult.ok).toBe(false);
    expect(listedResult.ok === false && listedResult.message).toBe(
      messages.unsubscribeTooMany,
    );
    expect(store.subscribers.get("reader@example.com")?.unsubscribedAt).toBeNull();
  });
});
