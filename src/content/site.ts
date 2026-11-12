import type { FlagName } from "@/server/flags";

export const site = {
  name: "Ram Ganga Agro",
  domain: "rgagro.me",
  url: "https://rgagro.me",
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
