/**
 * The development Neon endpoint. Production is named so a script can refuse it
 * before opening a connection. These identifiers are already in
 * scripts/verify-dev-database.mjs. A unit test keeps the two copies the same.
 */
export const DEVELOPMENT_ENDPOINT = "ep-flat-credit-a1e3xifz";
export const PRODUCTION_ENDPOINT = "ep-curly-salad-a10wokga";

/** Throws before a query when the URL is not the development branch. */
export function assertDevelopmentDatabase(url: string, role?: string): void {
  let hostname = "";
  let username = "";
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
    username = decodeURIComponent(parsed.username);
  } catch {
    throw new Error("Refusing a connection that is not the development branch.");
  }

  if (
    hostname.includes(PRODUCTION_ENDPOINT) ||
    !hostname.startsWith(DEVELOPMENT_ENDPOINT)
  ) {
    throw new Error("Refusing a connection that is not the development branch.");
  }

  if (role && username !== role) {
    throw new Error(`Expected the ${role} login.`);
  }
}

export function redactConnectionString(message: string): string {
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-url]");
}
