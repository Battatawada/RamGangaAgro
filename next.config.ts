import type { NextConfig } from "next";
import {
  securityHeaders,
  serverActionOrigins,
} from "./src/server/security-headers";

/**
 * Content-Security-Policy is set per request by clerkMiddleware in src/proxy.ts,
 * because strict mode needs a fresh nonce. The headers below are request-independent.
 * Server Actions accept only the production hostnames. Next already allows
 * the dev server's own origin, so it is not listed here.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  agentRules: false,
  experimental: {
    serverActions: {
      allowedOrigins: [...serverActionOrigins],
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env) }];
  },
};

export default nextConfig;
