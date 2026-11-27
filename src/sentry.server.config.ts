import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  integrations: [Sentry.serveTunnelIntegration()],
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,
});
