import "server-only";

export type FlagName =
  | "ACCOUNTS_ENABLED"
  | "ADMIN_UI_ENABLED"
  | "STOREFRONT_ENABLED"
  | "CHECKOUT_ENABLED"
  | "PAYMENTS_ENABLED";

export type Flags = Record<FlagName, boolean>;

const FLAG_NAMES: FlagName[] = [
  "ACCOUNTS_ENABLED",
  "ADMIN_UI_ENABLED",
  "STOREFRONT_ENABLED",
  "CHECKOUT_ENABLED",
  "PAYMENTS_ENABLED",
];

function parse(value: string | undefined): boolean {
  return value === "true";
}

export function readFlags(env: NodeJS.ProcessEnv = process.env): Flags {
  const flags = Object.fromEntries(
    FLAG_NAMES.map((name) => [name, parse(env[name])]),
  ) as Flags;
  assertFlagInvariant(flags);
  return flags;
}

/**
 * Checkout cannot run without a storefront, and payments cannot run without
 * checkout. A process that boots with an impossible combination refuses to
 * serve traffic rather than guessing which flag was meant.
 */
export function assertFlagInvariant(flags: Flags): void {
  if (flags.CHECKOUT_ENABLED && !flags.STOREFRONT_ENABLED) {
    throw new Error(
      "Flag invariant failed: CHECKOUT_ENABLED requires STOREFRONT_ENABLED.",
    );
  }
  if (flags.PAYMENTS_ENABLED && !flags.CHECKOUT_ENABLED) {
    throw new Error(
      "Flag invariant failed: PAYMENTS_ENABLED requires CHECKOUT_ENABLED.",
    );
  }
}

export const flags: Flags = readFlags();

export function isEnabled(name: FlagName): boolean {
  return flags[name];
}
