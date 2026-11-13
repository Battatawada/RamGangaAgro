/**
 * Allowances for the three public writes. The buckets are separate, so using
 * up the contact allowance does not block unsubscribe. The address is never
 * part of a key.
 */

export type RateLimiter = {
  /** Returns false once the key has used its allowance for the window. */
  check(key: string, limit: number, windowSeconds: number): Promise<boolean>;
};

export type RateLimitOperation = "contact" | "newsletter" | "unsubscribe";

export type RateLimitBucket = {
  key: string;
  limit: number;
  windowSeconds: number;
};

const HOUR = 60 * 60;

export const operationLimits = {
  contact: { perIp: 5, global: 30, windowSeconds: HOUR },
  newsletter: { perIp: 5, global: 30, windowSeconds: HOUR },
  unsubscribe: { perIp: 8, global: 40, windowSeconds: HOUR },
} as const;

const SAFE_SUBJECT = /^[a-z0-9:._-]{1,80}$/;

/**
 * An address, the local bucket, or one shared bucket for anything else.
 * Email-shaped and other arbitrary strings collapse to `untrusted`, so they
 * cannot be used as a public identifier.
 */
export function rateLimitSubject(ip: string): string {
  const trimmed = ip.trim().toLowerCase();
  if (!SAFE_SUBJECT.test(trimmed)) return "untrusted";
  return trimmed;
}

export function bucketsFor(operation: RateLimitOperation, ip: string): RateLimitBucket[] {
  const limits = operationLimits[operation];
  const subject = rateLimitSubject(ip);
  return [
    {
      key: `${operation}:ip:${subject}`,
      limit: limits.perIp,
      windowSeconds: limits.windowSeconds,
    },
    {
      key: `${operation}:all`,
      limit: limits.global,
      windowSeconds: limits.windowSeconds,
    },
  ];
}

const SAFE_KEY = /^[a-z0-9:._-]{3,160}$/;

/** Every provider refuses a key that could carry an email address or SQL. */
export function assertRateLimitRequest(
  key: string,
  limit: number,
  windowSeconds: number,
): void {
  if (!SAFE_KEY.test(key)) {
    throw new Error("Refusing an unsafe rate-limit key.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 10_000) {
    throw new Error("Refusing an unsafe rate-limit allowance.");
  }
  if (
    !Number.isInteger(windowSeconds) ||
    windowSeconds < 1 ||
    windowSeconds > 86_400
  ) {
    throw new Error("Refusing an unsafe rate-limit window.");
  }
}
