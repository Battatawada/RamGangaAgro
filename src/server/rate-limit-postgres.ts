import "server-only";
import { sql, type SQL } from "drizzle-orm";
import {
  assertRateLimitRequest,
  type RateLimiter,
} from "@/server/rate-limit-policy";

export type RateLimitQuery = {
  execute: (query: SQL) => Promise<unknown>;
};

/**
 * One atomic upsert. The window is fixed: the first accepted write starts it,
 * and the counter resets only after `reset_at`. A store error throws, which
 * the form actions treat as a refusal.
 */
export function createPostgresLimiter(db: RateLimitQuery): RateLimiter {
  return {
    async check(key, limit, windowSeconds) {
      assertRateLimitRequest(key, limit, windowSeconds);

      const rows = await db.execute(sql`
        insert into rate_limit_buckets (bucket_key, hit_count, reset_at)
        values (
          ${key},
          1,
          now() + (${windowSeconds} * interval '1 second')
        )
        on conflict (bucket_key) do update
        set
          hit_count = case
            when rate_limit_buckets.reset_at <= now() then 1
            else rate_limit_buckets.hit_count + 1
          end,
          reset_at = case
            when rate_limit_buckets.reset_at <= now() then now() + (${windowSeconds} * interval '1 second')
            else rate_limit_buckets.reset_at
          end
        returning hit_count
      `);

      const count = readCount(rows);
      if (count === 1) {
        try {
          await db.execute(sql`
            delete from rate_limit_buckets
            where reset_at < now() - interval '1 day'
          `);
        } catch {
          // A missed cleanup must not turn an allowed write into a failure.
        }
      }
      return count <= limit;
    },
  };
}

function readCount(result: unknown): number {
  const row = firstRow(result);
  const value = row?.hit_count;
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("Rate limit store returned no count.");
  }
  return count;
}

function firstRow(result: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(result)) {
    const row = result[0];
    return isRecord(row) ? row : undefined;
  }
  if (isRecord(result) && Array.isArray(result.rows)) {
    const row = result.rows[0];
    return isRecord(row) ? row : undefined;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
