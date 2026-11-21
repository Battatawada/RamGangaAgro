import type { Metadata } from "next";
import { farmLocation } from "@/content/contact-config";
import { hreflangAlternates } from "@/content/hreflang";
import { ogImageUrl } from "@/content/og";
import { pageMeta } from "@/content/meta";
import { isPageSearchIndexable } from "@/content/search-index";

type PageSeo = {
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  /** Utility pages stay out of the sitemap. Some also use robots here. */
  index?: false;
};

/**
 * One title and description per public page. Crop entries are added beside
 * these paths in the sitemap.
 */
export const publicPageSeo = [
  {
    path: "/",
    title: "Ram Ganga Agro — Raktshali rice and wheat in Baran, Rajasthan",
    description: `Ram Ganga Agro grows Raktshali (Rakthashali) rice and wheat at ${farmLocation}. The farm practices natural farming. Nothing on this site is for sale yet.`,
    absoluteTitle: true,
  },
  {
    path: "/our-farm",
    title: "Our farm at Mamoni, Baran | Ram Ganga Agro",
    description: `Ram Ganga Agro is a working farm at ${farmLocation}. Story, land, and practices pages are being written.`,
  },
  {
    path: "/our-farm/story",
    title: "Our story | Ram Ganga Agro",
    description: `The people behind Ram Ganga Agro at ${farmLocation}. The full story is not published yet.`,
  },
  {
    path: "/our-farm/the-land",
    title: "The land at Mamoni | Ram Ganga Agro",
    description: `Where Ram Ganga Agro grows its crops at ${farmLocation}. Field notes and maps are not published yet.`,
  },
  {
    path: "/our-farm/practices",
    title: "Natural farming practices | Ram Ganga Agro",
    description: `Ram Ganga Agro practices natural farming at ${farmLocation}. Methods and inputs are not described on this page yet.`,
  },
  {
    path: "/grow",
    title: "What we grow at Mamoni, Baran | Ram Ganga Agro",
    description: `Raktshali (Rakthashali) rice and wheat grown at ${farmLocation} by Ram Ganga Agro. A name here is a crop in the field, not a product for sale.`,
  },
  {
    path: "/journal",
    title: "Farm journal | Ram Ganga Agro",
    description: `Season notes from Ram Ganga Agro at ${farmLocation}. Posts appear when there is a harvest to record.`,
  },
  {
    path: "/contact",
    title: "Contact Ram Ganga Agro, Baran | Enquiries",
    description: `Write to Ram Ganga Agro at ${farmLocation} about Raktshali rice, wheat, or wholesale enquiries.`,
  },
  {
    path: "/follow",
    title: "First-harvest waitlist | Ram Ganga Agro",
    description: `One email from Ram Ganga Agro when the next harvest of Raktshali rice or wheat is available from ${farmLocation}.`,
  },
  {
    path: "/unsubscribe",
    title: "Unsubscribe from harvest notes",
    description: "Remove your email from the Ram Ganga Agro harvest list.",
    index: false,
  },
  {
    path: "/privacy",
    title: "Privacy | Ram Ganga Agro",
    description:
      "How Ram Ganga Agro handles contact form messages, harvest waitlist signups, and website analytics.",
  },
  {
    path: "/terms",
    title: "Terms | Ram Ganga Agro",
    description:
      "Terms for using the Ram Ganga Agro website. The site describes the farm at Mamoni, Baran. Nothing here is offered for sale.",
  },
  {
    path: "/wholesale",
    title: "Wholesale enquiries | Ram Ganga Agro",
    description: `Request a quote for Raktshali rice or wheat from Ram Ganga Agro at ${farmLocation}. MOQ and terms are confirmed on reply.`,
  },
  {
    path: "/shop",
    title: "The harvest | Ram Ganga Agro",
    description: `Grain packs from Ram Ganga Agro at ${farmLocation}. Prices and weights appear when the farm confirms them.`,
    index: false,
  },
  {
    path: "/cart",
    title: "Your bag | Ram Ganga Agro",
    description: "Your bag at Ram Ganga Agro.",
    index: false,
  },
  {
    path: "/checkout",
    title: "Checkout | Ram Ganga Agro",
    description: "Checkout for Ram Ganga Agro.",
    index: false,
  },
  {
    path: "/checkout/success",
    title: "Order received | Ram Ganga Agro",
    description: "Checkout confirmation for Ram Ganga Agro.",
    index: false,
  },
  {
    path: "/checkout/cancel",
    title: "Checkout cancelled | Ram Ganga Agro",
    description: "Checkout was not completed.",
    index: false,
  },
  {
    path: "/account",
    title: "Your account | Ram Ganga Agro",
    description: "Order history for Ram Ganga Agro.",
    index: false,
  },
] as const satisfies readonly PageSeo[];

const byPath = new Map(publicPageSeo.map((page) => [page.path, page]));

function robotsForPath(path: string): Metadata["robots"] | undefined {
  const page = byPath.get(path as (typeof publicPageSeo)[number]["path"]);
  if (page && "index" in page && page.index === false) {
    return { index: false, follow: true };
  }
  if (!isPageSearchIndexable(path)) {
    return { index: false, follow: true };
  }
  return undefined;
}

export function metadataFor(path: (typeof publicPageSeo)[number]["path"]): Metadata {
  const page = byPath.get(path);
  if (!page) throw new Error(`No SEO entry for ${path}`);

  const base = pageMeta({
    title: page.title,
    description: page.description,
    path: page.path,
    absoluteTitle: "absoluteTitle" in page ? page.absoluteTitle : undefined,
  });

  const robots = robotsForPath(path);
  const image = ogImageUrl(page.path);

  const alternates = hreflangAlternates(path) ?? base.alternates;

  return {
    ...base,
    alternates,
    ...(robots ? { robots } : {}),
    openGraph: {
      ...base.openGraph,
      images: [{ url: image, alt: page.title }],
    },
    twitter: {
      ...base.twitter,
      images: [image],
    },
  };
}

export function metadataForPath(
  path: string,
  input: { title: string; description: string; absoluteTitle?: boolean },
): Metadata {
  const base = pageMeta({
    title: input.title,
    description: input.description,
    path,
    absoluteTitle: input.absoluteTitle,
  });
  const robots = robotsForPath(path);
  const image = ogImageUrl(path);

  const alternates = hreflangAlternates(path) ?? base.alternates;

  return {
    ...base,
    alternates,
    ...(robots ? { robots } : {}),
    openGraph: {
      ...base.openGraph,
      images: [{ url: image, alt: input.title }],
    },
    twitter: {
      ...base.twitter,
      images: [image],
    },
  };
}

export function indexablePaths(): string[] {
  return publicPageSeo
    .filter((page) => !("index" in page && page.index === false))
    .map((page) => page.path)
    .filter((path) => isPageSearchIndexable(path));
}

/** Descriptions stay inside what the crop page is allowed to say. */
export function cropDescription(slug: string, summary: string): string {
  if (slug === "raktshali-rice") {
    return `Raktshali (Rakthashali, Raktashali) from ${farmLocation}, grown by Ram Ganga Agro. It is currently growing in the field. It is not for sale.`;
  }
  if (slug === "wheat") {
    return `Farm-grown wheat from ${farmLocation} at Ram Ganga Agro. Variety and harvest details are not published yet.`;
  }
  return summary;
}

export function metadataForShopProduct(name: string, path: string): Metadata {
  return metadataForPath(path, {
    title: `${name} pack | Ram Ganga Agro`,
    description: `${name} from Ram Ganga Agro at ${farmLocation}. Net quantity and price are listed when the farm confirms them.`,
  });
}

export function cropTitle(slug: string, name: string): string {
  if (slug === "raktshali-rice") {
    return `Raktshali (Rakthashali) from Baran, Rajasthan | Ram Ganga Agro`;
  }
  if (slug === "wheat") {
    return `Farm-grown wheat from Mamoni, Baran, Rajasthan | Ram Ganga Agro`;
  }
  return `${name} — Ram Ganga Agro`;
}