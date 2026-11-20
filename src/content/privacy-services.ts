import "server-only";

export function privacyServiceFlags() {
  const analytics = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
  const transactionalEmail = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.TRANSACTIONAL_FROM_EMAIL?.trim(),
  );

  return { analytics, transactionalEmail } as const;
}