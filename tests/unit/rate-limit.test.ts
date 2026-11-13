import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeIp, clientIpFromHeaders } from "@/server/client-ip";
import {
  resolveIpSource,
  resolveRateLimitConfig,
} from "@/server/rate-limit-config";
import { bucketsFor, operationLimits, rateLimitSubject } from "@/server/rate-limit-policy";
import { createPostgresLimiter } from "@/server/rate-limit-postgres";
import {
  createMemoryLimiter,
  getRateLimiter,
  setRateLimiterForTests,
} from "@/server/rate-limit";

describe("rate limit configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    setRateLimiterForTests(undefined);
  });

  it("uses memory only for an unconfigured test process", () => {
    expect(resolveRateLimitConfig({}, "test")).toEqual({
      ok: true,
      provider: "memory",
    });
  });

  it("refuses an unconfigured development or production process", () => {
    expect(resolveRateLimitConfig({}, "development").ok).toBe(false);
    expect(resolveRateLimitConfig({}, "production").ok).toBe(false);
    expect(resolveRateLimitConfig({ RATE_LIMIT_PROVIDER: "memory" }, "production").ok).toBe(
      false,
    );
  });

  it("accepts postgres only when the app database URL is present", () => {
    expect(
      resolveRateLimitConfig({ RATE_LIMIT_PROVIDER: "postgres" }, "production").ok,
    ).toBe(false);
    expect(
      resolveRateLimitConfig(
        { RATE_LIMIT_PROVIDER: "postgres", DATABASE_URL: "postgres://rga_app@db/app" },
        "production",
      ),
    ).toEqual({ ok: true, provider: "postgres" });
  });

  it("rejects an Upstash URL or token that cannot be used safely", () => {
    const token = "t".repeat(24);
    expect(
      resolveRateLimitConfig(
        {
          RATE_LIMIT_PROVIDER: "upstash",
          RATE_LIMIT_REDIS_URL: "http://example.upstash.io",
          RATE_LIMIT_TOKEN: token,
        },
        "production",
      ).ok,
    ).toBe(false);
    expect(
      resolveRateLimitConfig(
        {
          RATE_LIMIT_PROVIDER: "upstash",
          RATE_LIMIT_REDIS_URL: `https://example.upstash.io/?token=${token}`,
          RATE_LIMIT_TOKEN: token,
        },
        "production",
      ).ok,
    ).toBe(false);
    expect(
      resolveRateLimitConfig(
        {
          RATE_LIMIT_PROVIDER: "upstash",
          RATE_LIMIT_REDIS_URL: "https://example.upstash.io",
          RATE_LIMIT_TOKEN: token,
        },
        "production",
      ),
    ).toEqual({
      ok: true,
      provider: "upstash",
      url: "https://example.upstash.io",
      token,
    });
  });

  it("throws from the runtime helper instead of building a memory limiter", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_PROVIDER", "");
    expect(() => getRateLimiter()).toThrow(/RATE_LIMIT_PROVIDER/);
  });
});

describe("client address", () => {
  it("ignores forwarded headers when the source is direct", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.8",
      "x-vercel-forwarded-for": "203.0.113.9",
    });
    expect(clientIpFromHeaders(headers, "direct")).toBe("local");
  });

  it("on Vercel ignores a caller-supplied forwarded header", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.4",
      "x-real-ip": "198.51.100.5",
    });
    expect(clientIpFromHeaders(headers, "vercel")).toBe("untrusted");

    headers.set("x-vercel-forwarded-for", "203.0.113.10, 198.51.100.1");
    expect(clientIpFromHeaders(headers, "vercel")).toBe("203.0.113.10");
  });

  it("collapses arbitrary forwarded values onto one bucket", () => {
    const first = clientIpFromHeaders(
      new Headers({ "x-forwarded-for": "not-an-ip" }),
      "trusted-proxy",
    );
    const second = clientIpFromHeaders(
      new Headers({ "x-forwarded-for": "also-not-an-ip" }),
      "trusted-proxy",
    );
    expect(first).toBe("untrusted");
    expect(second).toBe("untrusted");
  });

  it("accepts an IPv4 address with a port and a normal IPv6 address", () => {
    expect(normalizeIp("203.0.113.8:443")).toBe("203.0.113.8");
    expect(normalizeIp("2001:DB8::1")).toBe("2001:db8::1");
    expect(normalizeIp("[2001:db8::2]:443")).toBe("2001:db8::2");
  });

  it("refuses direct mode in production and defaults to it in development", () => {
    expect(resolveIpSource({}, "development")).toBe("direct");
    expect(() => resolveIpSource({}, "production")).toThrow(/Production requires/);
    expect(() => resolveIpSource({ RATE_LIMIT_IP_SOURCE: "direct" }, "production")).toThrow(
      /Production requires/,
    );
    expect(resolveIpSource({ RATE_LIMIT_IP_SOURCE: "vercel" }, "production")).toBe(
      "vercel",
    );
  });
});

describe("rate limit policy", () => {
  it("keeps the three operations on separate keys and never uses an email", () => {
    const contact = bucketsFor("contact", "Reader@Example.com");
    const newsletter = bucketsFor("newsletter", "203.0.113.8");
    const unsubscribe = bucketsFor("unsubscribe", "203.0.113.8");

    expect(contact.map((bucket) => bucket.key)).toEqual([
      "contact:ip:untrusted",
      "contact:all",
    ]);
    expect(newsletter[0]?.key).toBe("newsletter:ip:203.0.113.8");
    expect(unsubscribe[0]?.key).toBe("unsubscribe:ip:203.0.113.8");
    expect(newsletter[0]?.limit).toBe(operationLimits.newsletter.perIp);
    expect(unsubscribe[0]?.limit).not.toBe(contact[0]?.limit);
    expect(JSON.stringify(contact)).not.toContain("@");
  });

  it("shares one subject for local development", () => {
    expect(rateLimitSubject("local")).toBe("local");
    expect(rateLimitSubject("  LOCAL ")).toBe("local");
  });
});

describe("postgres limiter", () => {
  it("does not query when the key is unsafe", async () => {
    const db = {
      async execute() {
        throw new Error("should not query");
      },
    };
    const limiter = createPostgresLimiter(db);
    await expect(limiter.check("contact:email:reader@example.com", 5, 60)).rejects.toThrow(
      /unsafe/,
    );
  });

  it("allows while the stored count is inside the window and refuses after it", async () => {
    const queries: string[] = [];
    const db = {
      async execute(query: { queryChunks?: unknown }) {
        queries.push(String(query));
        if (queries.length === 1) return [{ hit_count: 1 }];
        return [{ hit_count: 6 }];
      },
    };
    const limiter = createPostgresLimiter(db);
    await expect(limiter.check("contact:ip:203.0.113.8", 5, 3600)).resolves.toBe(true);
    await expect(limiter.check("contact:ip:203.0.113.8", 5, 3600)).resolves.toBe(false);
  });

  it("throws when the store returns no count", async () => {
    const limiter = createPostgresLimiter({
      async execute() {
        return [];
      },
    });
    await expect(limiter.check("contact:all", 30, 3600)).rejects.toThrow(/no count/);
  });
});

describe("memory limiter", () => {
  it("resets after the window and does not share keys", async () => {
    let now = 1_000;
    const limiter = createMemoryLimiter(() => now);
    expect(await limiter.check("contact:ip:local", 1, 10)).toBe(true);
    expect(await limiter.check("contact:ip:local", 1, 10)).toBe(false);
    expect(await limiter.check("newsletter:ip:local", 1, 10)).toBe(true);
    now += 10_000;
    expect(await limiter.check("contact:ip:local", 1, 10)).toBe(true);
  });
});
