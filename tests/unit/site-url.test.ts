import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/content/site";
import {
  augmentContentSecurityPolicy,
  securityHeaders,
  serverActionOrigins,
  shareImageRobotsHeaders,
} from "@/server/security-headers";

describe("production origin", () => {
  it("defaults to the apex and accepts only the two public hostnames", () => {
    expect(resolveSiteUrl(undefined)).toBe("https://rgagro.me");
    expect(resolveSiteUrl("  https://www.rgagro.me  ")).toBe("https://rgagro.me");
    expect(() => resolveSiteUrl("http://localhost:3000")).toThrow(/SITE_URL/);
    expect(() => resolveSiteUrl("https://rgagro.me.evil.example")).toThrow(/SITE_URL/);
    expect(() => resolveSiteUrl("https://rgagro.me/contact")).toThrow(/SITE_URL/);
  });

  it("does not add a development origin to server actions", async () => {
    expect(serverActionOrigins).toEqual(["rgagro.me", "www.rgagro.me"]);
    const config = await readFile("next.config.ts", "utf8");
    expect(config).not.toContain("localhost");
  });

  it("sends HSTS only for a production host", () => {
    expect(securityHeaders({}).map((header) => header.key)).not.toContain(
      "Strict-Transport-Security",
    );
    const production = securityHeaders({ VERCEL_ENV: "production" });
    expect(production).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    });
    expect(securityHeaders({ APP_ENV: "production" })).toContainEqual({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    });
  });

  it("marks extensionless share images noindex so Google does not index the PNG as a page", () => {
    expect(shareImageRobotsHeaders).toEqual([
      {
        source: "/opengraph-image",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/twitter-image",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ]);
  });

  it("sets clickjacking and cross-origin isolation headers on every response", () => {
    const keys = securityHeaders({}).map((header) => header.key);
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("Cross-Origin-Opener-Policy");
  });

  it("augments Clerk CSP with frame-ancestors, base-uri, and Trusted Types", () => {
    const csp = augmentContentSecurityPolicy("default-src 'self'; script-src 'nonce-abc'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("require-trusted-types-for 'script'");
    expect(csp).toContain("trusted-types default");
    expect(csp).toContain("script-src 'nonce-abc' https://scripts.simpleanalyticscdn.com");
    expect(csp).toContain("https://queue.simpleanalyticscdn.com");
    expect(csp).toContain("https://*.ingest.de.sentry.io");
  });
});
