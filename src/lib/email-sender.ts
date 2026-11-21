/**
 * Parses TRANSACTIONAL_FROM_EMAIL for Brevo: `name@domain` or `Name <name@domain>`.
 */
export function parseTransactionalSender(
  raw: string,
): { email: string; name?: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const angle = /^(.+?)\s*<([^>]+)>$/.exec(trimmed);
  if (angle) {
    const name = angle[1]?.trim();
    const email = angle[2]?.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return name ? { email, name } : { email };
    }
    return null;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { email: trimmed };
  }

  return null;
}