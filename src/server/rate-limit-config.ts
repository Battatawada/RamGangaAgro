/**
 * Rate-limit configuration. This module does not open a store and does not
 * read operator database URLs. Postgres uses the app's DATABASE_URL, which
 * getDb() already owns. Upstash is optional and is selected only by name.
 */

export type RateLimitProviderName = "memory" | "postgres" | "upstash";

export type RateLimitConfig =
  | { ok: true; provider: "memory" }
  | { ok: true; provider: "postgres" }
  | { ok: true; provider: "upstash"; url: string; token: string }
  | { ok: false; reason: string };

export type IpSource = "vercel" | "trusted-proxy" | "direct";

export type RateLimitEnv = {
  NODE_ENV?: string;
  DATABASE_URL?: string;
  RATE_LIMIT_PROVIDER?: string;
  RATE_LIMIT_IP_SOURCE?: string;
  RATE_LIMIT_REDIS_URL?: string;
  RATE_LIMIT_TOKEN?: string;
};

const PROVIDERS = new Set(["postgres", "upstash"]);

/**
 * Tests get an in-memory counter only when no provider is configured. Any
 * other environment without postgres or upstash is refused, including an
 * explicit "memory" value. Production cannot turn the limiter off by leaving
 * the variable empty.
 */
export function resolveRateLimitConfig(
  env: RateLimitEnv,
  nodeEnv: string,
): RateLimitConfig {
  const provider = env.RATE_LIMIT_PROVIDER?.trim() ?? "";

  if (!provider) {
    if (nodeEnv === "test") return { ok: true, provider: "memory" };
    return {
      ok: false,
      reason: "RATE_LIMIT_PROVIDER must be postgres or upstash outside tests.",
    };
  }

  if (!PROVIDERS.has(provider)) {
    return {
      ok: false,
      reason: "RATE_LIMIT_PROVIDER must be postgres or upstash.",
    };
  }

  if (provider === "postgres") {
    if (!env.DATABASE_URL?.trim()) {
      return {
        ok: false,
        reason: "RATE_LIMIT_PROVIDER=postgres requires DATABASE_URL.",
      };
    }
    return { ok: true, provider: "postgres" };
  }

  const url = env.RATE_LIMIT_REDIS_URL?.trim() ?? "";
  const token = env.RATE_LIMIT_TOKEN?.trim() ?? "";
  if (!validUpstashUrl(url) || token.length < 20 || url.includes(token)) {
    return { ok: false, reason: "Upstash rate limit configuration is invalid." };
  }
  return { ok: true, provider: "upstash", url, token };
}

function validUpstashUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.username === "" &&
      parsed.password === "" &&
      parsed.search === "" &&
      parsed.hash === ""
    );
  } catch {
    return false;
  }
}

/**
 * Production must name the proxy that is allowed to supply the client address.
 * `direct` ignores forwarded headers and is only for a machine that is not on
 * the public internet. A missing value in production is refused. Elsewhere it
 * means direct.
 */
export function resolveIpSource(env: RateLimitEnv, nodeEnv: string): IpSource {
  const raw = env.RATE_LIMIT_IP_SOURCE?.trim() ?? "";
  if (raw && raw !== "vercel" && raw !== "trusted-proxy" && raw !== "direct") {
    throw new Error(
      "RATE_LIMIT_IP_SOURCE must be vercel, trusted-proxy, or direct.",
    );
  }

  if (nodeEnv === "production") {
    if (raw === "vercel" || raw === "trusted-proxy") return raw;
    throw new Error(
      "Production requires RATE_LIMIT_IP_SOURCE=vercel or RATE_LIMIT_IP_SOURCE=trusted-proxy.",
    );
  }

  if (raw === "vercel" || raw === "trusted-proxy" || raw === "direct") return raw;
  return "direct";
}
