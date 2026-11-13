import "server-only";
import { Redis } from "@upstash/redis";
import { getDb } from "@/server/db";
import { resolveRateLimitConfig } from "@/server/rate-limit-config";
import { createPostgresLimiter } from "@/server/rate-limit-postgres";
import {
  assertRateLimitRequest,
  type RateLimiter,
} from "@/server/rate-limit-policy";

export type { RateLimiter };

const UPSTASH_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], tonumber(ARGV[1]))
end
return current
`;

/**
 * In-memory counting. Correct only inside one process, so it is used when
 * NODE_ENV is test and no provider is configured. It is not a provider name
 * that development or production can select.
 */
export function createMemoryLimiter(now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    async check(key, limit, windowSeconds) {
      assertRateLimitRequest(key, limit, windowSeconds);
      const current = hits.get(key);
      const time = now();

      if (!current || current.resetAt <= time) {
        hits.set(key, { count: 1, resetAt: time + windowSeconds * 1000 });
        return true;
      }
      if (current.count >= limit) {
        return false;
      }
      current.count += 1;
      return true;
    },
  };
}

/**
 * Atomic fixed window on Upstash Redis. A timeout or a transport error throws.
 * The form then refuses the write. This does not use @upstash/ratelimit, whose
 * default timeout answers success when Redis is slow.
 */
export function createUpstashLimiter(url: string, token: string): RateLimiter {
  let redis: Redis | undefined;

  return {
    async check(key, limit, windowSeconds) {
      assertRateLimitRequest(key, limit, windowSeconds);
      redis ??= new Redis({ url, token });
      const count = await redis.eval(
        UPSTASH_SCRIPT,
        [`rga:rl:${key}`],
        [String(windowSeconds)],
      );
      const hits = typeof count === "number" ? count : Number(count);
      if (!Number.isInteger(hits) || hits < 1) {
        throw new Error("Rate limit store returned no count.");
      }
      return hits <= limit;
    },
  };
}

let limiter: RateLimiter | undefined;

/**
 * Development and production use the configured shared store. A missing or
 * invalid configuration throws. Callers refuse the write. They do not fall
 * back to the in-memory counter.
 */
export function getRateLimiter(): RateLimiter {
  if (limiter) return limiter;

  const resolved = resolveRateLimitConfig(
    process.env,
    process.env.NODE_ENV ?? "development",
  );
  if (!resolved.ok) {
    throw new Error(resolved.reason);
  }

  if (resolved.provider === "memory") {
    limiter = createMemoryLimiter();
    return limiter;
  }

  if (resolved.provider === "postgres") {
    limiter = createPostgresLimiter(getDb());
    return limiter;
  }

  limiter = createUpstashLimiter(resolved.url, resolved.token);
  return limiter;
}

/** Tests inject their own store. Nothing else calls this. */
export function setRateLimiterForTests(next: RateLimiter | undefined): void {
  limiter = next;
}
