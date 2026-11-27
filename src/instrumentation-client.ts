import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
const path = typeof window === "undefined" ? "" : window.location.pathname;
const replayOnError = path === "/cart" || path.startsWith("/cart/") || path === "/checkout" || path.startsWith("/checkout/");

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tunnel: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: replayOnError ? 1 : 0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
