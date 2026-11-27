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

/**
 * File-convention share images are PNGs at extensionless URLs. Google will
 * index the URL as a page and then report that it could not read any content.
 * noindex applies to the image URL only. Social crawlers still fetch it.
 */
export const shareImageRobotsHeaders: {
  source: string;
  headers: { key: string; value: string }[];
}[] = ["/opengraph-image", "/twitter-image"].map((source) => ({
  source,
  headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
}));

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

/** Hosts the app may call. The script still loads only when its env flag is set. */
const CSP_SOURCES_TO_ADD: Record<string, readonly string[]> = {
  "script-src": ["https://scripts.simpleanalyticscdn.com"],
  "connect-src": [
    "https://queue.simpleanalyticscdn.com",
    "https://*.ingest.de.sentry.io",
    "https://*.ingest.us.sentry.io",
    "https://*.ingest.sentry.io",
  ],
};

function directiveName(part: string): string {
  return part.split(/\s+/)[0] ?? part;
}

/** Adds missing clickjacking, base-uri, Trusted Types, analytics, and error-reporting hosts. */
export function augmentContentSecurityPolicy(csp: string): string {
  const parts = csp
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const seen = new Set(parts.map(directiveName));

  const withSources = parts.map((part) => {
    const extra = CSP_SOURCES_TO_ADD[directiveName(part)];
    if (!extra) return part;
    const have = new Set(part.split(/\s+/).slice(1));
    const missing = extra.filter((source) => !have.has(source));
    return missing.length === 0 ? part : `${part} ${missing.join(" ")}`;
  });

  for (const [name, sources] of Object.entries(CSP_SOURCES_TO_ADD)) {
    if (seen.has(name)) continue;
    withSources.push(`${name} ${sources.join(" ")}`);
    seen.add(name);
  }

  for (const directive of CSP_DIRECTIVES_TO_ENSURE) {
    const name = directiveName(directive);
    if (seen.has(name)) continue;
    withSources.push(directive);
    seen.add(name);
  }

  return withSources.join("; ");
}

/** Headers that depend on the per-request CSP from clerkMiddleware. */
export function applyDynamicSecurityHeaders(response: NextResponse): void {
  const csp = response.headers.get("Content-Security-Policy");
  if (csp) {
    response.headers.set("Content-Security-Policy", augmentContentSecurityPolicy(csp));
  }
}