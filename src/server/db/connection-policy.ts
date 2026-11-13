/**
 * Host allowlist for the two Neon branches. Development scripts refuse the
 * production endpoint. The running app refuses every login except rga_app,
 * and in production it also refuses the development endpoint.
 * These identifiers are duplicated in scripts/verify-dev-database.mjs.
 * A unit test keeps the copies the same.
 */
export const DEVELOPMENT_ENDPOINT = "ep-flat-credit-a1e3xifz";
export const PRODUCTION_ENDPOINT = "ep-curly-salad-a10wokga";

export const DATABASE_ROLES = [
  "rga_app",
  "rga_migrator",
  "rga_messages_reader",
  "rga_privacy",
] as const;

export type DatabaseRole = (typeof DATABASE_ROLES)[number];

type ParsedDatabaseUrl = {
  hostname: string;
  username: string;
};

function parsedDatabaseUrl(url: string): ParsedDatabaseUrl {
  const parsed = new URL(url);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Refusing a database URL that is not Postgres.");
  }
  return {
    hostname: parsed.hostname,
    username: decodeURIComponent(parsed.username),
  };
}

/** Throws before a query when the URL is not the development branch. */
export function assertDevelopmentDatabase(url: string, role?: string): void {
  let hostname = "";
  let username = "";
  try {
    ({ hostname, username } = parsedDatabaseUrl(url));
  } catch {
    throw new Error("Refusing a connection that is not the development branch.");
  }

  if (
    hostname.startsWith(PRODUCTION_ENDPOINT) ||
    !hostname.startsWith(DEVELOPMENT_ENDPOINT)
  ) {
    throw new Error("Refusing a connection that is not the development branch.");
  }

  if (role && username !== role) {
    throw new Error(`Expected the ${role} login.`);
  }
}

/**
 * Throws before a query unless the URL is the production branch, the named
 * restricted role, and the connection type that role is allowed to use.
 * The Neon owner login is refused because it is not one of the four roles.
 */
export function assertProductionDatabase(
  url: string,
  role: DatabaseRole,
  connection: "direct" | "pooled",
): void {
  let hostname = "";
  let username = "";
  try {
    ({ hostname, username } = parsedDatabaseUrl(url));
  } catch {
    throw new Error("Refusing a connection that is not the production branch.");
  }

  const pooled = hostname.includes("-pooler");
  if (
    !hostname.startsWith(PRODUCTION_ENDPOINT) ||
    hostname.startsWith(DEVELOPMENT_ENDPOINT) ||
    username !== role ||
    pooled !== (connection === "pooled")
  ) {
    throw new Error("Refusing a connection that is not the production branch.");
  }
}

/**
 * The Next.js process may open only the rga_app login. Production must be
 * the pooled production host. Any other environment refuses that host.
 */
export function assertAppConnection(url: string, nodeEnv: string): void {
  let hostname = "";
  let username = "";
  try {
    ({ hostname, username } = parsedDatabaseUrl(url));
  } catch {
    throw new Error("DATABASE_URL must be the rga_app login.");
  }

  if (username !== "rga_app") {
    throw new Error("DATABASE_URL must be the rga_app login.");
  }

  const productionHost = hostname.startsWith(PRODUCTION_ENDPOINT);
  const developmentHost = hostname.startsWith(DEVELOPMENT_ENDPOINT);
  if (productionHost && developmentHost) {
    throw new Error("DATABASE_URL must be the rga_app login.");
  }

  if (nodeEnv === "production") {
    if (!productionHost || !hostname.includes("-pooler")) {
      throw new Error("Production DATABASE_URL must be the pooled rga_app login.");
    }
    return;
  }

  if (productionHost) {
    throw new Error("Refusing the production database outside production.");
  }

  if (nodeEnv === "development" && !developmentHost) {
    throw new Error("Development DATABASE_URL must be the development rga_app login.");
  }
}

export function redactConnectionString(message: string): string {
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[redacted-url]");
}

/** prefer and require do not check the server certificate. verify-full does. */
export function databaseSsl(url: string): "verify-full" | false {
  return url.includes("sslmode=disable") ? false : "verify-full";
}
