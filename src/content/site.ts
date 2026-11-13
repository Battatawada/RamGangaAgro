import type { FlagName } from "@/server/flags";

const PRODUCTION_ORIGIN = "https://rgagro.me";
const ALLOWED_ORIGINS = new Set([PRODUCTION_ORIGIN, "https://www.rgagro.me"]);

/**
 * Canonical origin for metadata, the sitemap, and robots. Unset means the
 * apex. A development URL is refused rather than published.
 */
export function resolveSiteUrl(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return PRODUCTION_ORIGIN;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      "SITE_URL must be https://rgagro.me or https://www.rgagro.me.",
    );
  }

  if (
    !ALLOWED_ORIGINS.has(url.origin) ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.username !== "" ||
    url.password !== ""
  ) {
    throw new Error(
      "SITE_URL must be https://rgagro.me or https://www.rgagro.me.",
    );
  }

  return url.origin;
}

const origin = resolveSiteUrl(process.env.SITE_URL);

export const site = {
  name: "Ram Ganga Agro",
  domain: new URL(origin).hostname,
  url: origin,
  /** The deck is DRAFT copy from docs/06. The farm has not approved it yet. */
  description:
    "A farm, its crops, and the journey from the land to the table.",
} as const;

export type NavLink = {
  label: string;
  href: string;
  /** A link with a flag renders only while that flag is true. */
  flag?: FlagName;
};

export const primaryNav: NavLink[] = [
  { label: "Our Farm", href: "/our-farm" },
  { label: "What We Grow", href: "/grow" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
  { label: "Shop", href: "/shop", flag: "STOREFRONT_ENABLED" },
  { label: "Cart", href: "/cart", flag: "CHECKOUT_ENABLED" },
  { label: "Account", href: "/account", flag: "ACCOUNTS_ENABLED" },
];

export const footerLegalNav: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Unsubscribe", href: "/unsubscribe" },
];
