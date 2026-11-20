/**
 * Public contact, trust, and social details. Empty strings stay hidden in the UI.
 * WhatsApp is intentionally omitted; add a field here later if the farm wants it.
 */
const trim = (value: string | undefined) => value?.trim() ?? "";

export const farmLocation =
  "Mamoni, Shahbad tehsil, Baran district, Rajasthan" as const;

export const publicContact = {
  phone: trim(process.env.NEXT_PUBLIC_FARM_PHONE),
  email: trim(process.env.NEXT_PUBLIC_FARM_EMAIL),
  /** Shown on the contact page when NEXT_PUBLIC_RESPONSE_TIME is set. */
  responseTime: trim(process.env.NEXT_PUBLIC_RESPONSE_TIME),
} as const;

export const trustDetails = {
  fssai: trim(process.env.NEXT_PUBLIC_FSSAI),
  gstin: trim(process.env.NEXT_PUBLIC_GSTIN),
  postalAddress: trim(process.env.NEXT_PUBLIC_FARM_ADDRESS),
} as const;

export const socialProfiles = {
  instagram: trim(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
  facebook: trim(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
  youtube: trim(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
} as const;

export function filledSocialProfiles(): { label: string; href: string }[] {
  const entries: { label: string; key: keyof typeof socialProfiles }[] = [
    { label: "Instagram", key: "instagram" },
    { label: "Facebook", key: "facebook" },
    { label: "YouTube", key: "youtube" },
  ];
  return entries
    .map(({ label, key }) => {
      const href = socialProfiles[key];
      return href ? { label, href } : null;
    })
    .filter((item): item is { label: string; href: string } => item !== null);
}

export function organizationSameAs(): string[] {
  return Object.values(socialProfiles).filter((url) => url.length > 0);
}