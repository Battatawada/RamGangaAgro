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
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    ...(isProductionHeaderEnv(env)
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ]
      : []),
  ];
}
