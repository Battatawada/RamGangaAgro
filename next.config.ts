import type { NextConfig } from "next";

const isProduction =
  process.env.VERCEL_ENV === "production" || process.env.APP_ENV === "production";

/**
 * Content-Security-Policy is set per request by clerkMiddleware in src/proxy.ts,
 * because strict mode needs a fresh nonce. Everything below is request-independent.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  agentRules: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["rgagro.me", "www.rgagro.me", "localhost:3000"],
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
