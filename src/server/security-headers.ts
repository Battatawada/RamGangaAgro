import type { NextResponse } from "next/server";

/**
 * Request-independent response headers. The Clerk proxy sets the CSP nonce.
 * Local development is a same-origin host, so it is not listed here.
 */
export const serverActionOrigins = ["rgagro.me", "www.rgagro.me"] as const;

type HeaderEnv = {
  VERCEL_ENV?: string;
  APP_ENV?: string;
  [key: string]: string | undefined;
};

export function isProductionHeaderEnv(env: HeaderEnv): boolean {
  return env.VERCEL_ENV === "production" || env.APP_ENV === "production";
}

export function securityHeaders(env: HeaderEnv): { key: string; value: string }[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    ...(isProductionHeaderEnv(env)
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ]
      : []),
  ];
}

const CSP_DIRECTIVES_TO_ENSURE = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "require-trusted-types-for 'script'",
  "trusted-types default",
] as const;

/** Adds missing clickjacking, base-uri, and Trusted Types directives to Clerk CSP. */
export function augmentContentSecurityPolicy(csp: string): string {
  let next = csp;
  for (const directive of CSP_DIRECTIVES_TO_ENSURE) {
    const name = directive.split(" ")[0]!;
    if (!new RegExp(`(?:^|;\\s*)${name}\\s`).test(next)) {
      next = `${next}; ${directive}`;
    }
  }
  return next;
}

/** Headers that depend on the per-request CSP from clerkMiddleware. */
export function applyDynamicSecurityHeaders(response: NextResponse): void {
  const csp = response.headers.get("Content-Security-Policy");
  if (csp) {
    response.headers.set("Content-Security-Policy", augmentContentSecurityPolicy(csp));
  }
}