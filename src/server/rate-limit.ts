import "server-only";

export type RateLimiter = {
  /** Returns false once the key has used its allowance for the window. */
  check(key: string, limit: number, windowSeconds: number): Promise<boolean>;
};

/**
 * In-memory counting. Correct only inside one process, so it is allowed in
 * tests and nowhere else.
 */
export function createMemoryLimiter(now: () => number = Date.now): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    async check(key, limit, windowSeconds) {
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

function createUpstashLimiter(url: string, token: string): RateLimiter {
  return {
    async check(key, limit, windowSeconds) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url, token });
      const redisKey = `rga:rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      return count <= limit;
    },
  };
}

let limiter: RateLimiter | undefined;

/**
 * Dev and production use the shared store. If it is not configured the
 * limiter is absent, and the caller fails closed rather than silently
 * counting in one process.
 */
export function getRateLimiter(): RateLimiter {
  if (limiter) return limiter;

  if (process.env.NODE_ENV === "test") {
    limiter = createMemoryLimiter();
    return limiter;
  }

  const url = process.env.RATE_LIMIT_REDIS_URL;
  const token = process.env.RATE_LIMIT_TOKEN;
  if (!url || !token) {
    throw new Error(
      "RATE_LIMIT_REDIS_URL and RATE_LIMIT_TOKEN are required outside tests.",
    );
  }

  limiter = createUpstashLimiter(url, token);
  return limiter;
}

/** Tests inject their own store. Nothing else calls this. */
export function setRateLimiterForTests(next: RateLimiter | undefined): void {
  limiter = next;
}
