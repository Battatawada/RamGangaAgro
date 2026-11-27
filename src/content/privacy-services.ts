import "server-only";

export function privacyServiceFlags() {
  const simpleAnalytics = process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS?.trim() === "1";
  const googleAnalytics =
    !simpleAnalytics && Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
  const transactionalEmail = Boolean(
    process.env.BREVO_API_KEY?.trim() && process.env.TRANSACTIONAL_FROM_EMAIL?.trim(),
  );

  return { simpleAnalytics, googleAnalytics, transactionalEmail } as const;
}