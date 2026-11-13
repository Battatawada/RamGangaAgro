import type { Metadata } from "next";
import { pageMeta } from "@/content/meta";

type PageSeo = {
  path: string;
  title: string;
  description: string;
  absoluteTitle?: boolean;
  /** Utility pages stay out of the sitemap and out of the index. */
  index?: false;
};

/**
 * One title and description per public page. Each description uses a sentence
 * the page already stands behind. Crop and journal entries are added beside
 * these paths.
 */
export const publicPageSeo = [
  {
    path: "/",
    title: "Ram Ganga Agro — a working farm",
    description:
      "Ram Ganga Agro is a working farm. Raktshali and wheat are grown here, and the farm practices natural farming.",
    absoluteTitle: true,
  },
  {
    path: "/our-farm",
    title: "Our farm",
    description:
      "Ram Ganga Agro is a working farm. The story, the land, and natural farming are told as the farm shares them.",
  },
  {
    path: "/our-farm/story",
    title: "Our story",
    description:
      "The story of Ram Ganga Agro will be published in the farm’s own words.",
  },
  {
    path: "/our-farm/the-land",
    title: "The land",
    description:
      "The land will be described when the farm is ready to say where it is.",
  },
  {
    path: "/our-farm/practices",
    title: "Natural farming",
    description:
      "Ram Ganga Agro practices natural farming. The work in the field has not been described yet.",
  },
  {
    path: "/grow",
    title: "What we grow",
    description:
      "Raktshali and wheat are grown at Ram Ganga Agro. Another crop is named only when the farm confirms it.",
  },
  {
    path: "/journal",
    title: "The journal",
    description:
      "Notes from Ram Ganga Agro, written when there is a season to record.",
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Write to Ram Ganga Agro. The note is stored for the farm. No public email or phone number is listed.",
  },
  {
    path: "/follow",
    title: "Follow the farm",
    description: "Harvest notes from Ram Ganga Agro. Nothing is emailed yet.",
  },
  {
    path: "/unsubscribe",
    title: "Unsubscribe",
    description: "Remove an address from the harvest notes list.",
    index: false,
  },
  {
    path: "/privacy",
    title: "Privacy",
    description:
      "What Ram Ganga Agro stores when you write to the farm or follow the harvest notes.",
  },
  {
    path: "/terms",
    title: "Terms",
    description:
      "Terms for the Ram Ganga Agro website. Nothing on the site is offered for sale.",
  },
] as const satisfies readonly PageSeo[];

const byPath = new Map(publicPageSeo.map((page) => [page.path, page]));

export function metadataFor(path: (typeof publicPageSeo)[number]["path"]): Metadata {
  const page = byPath.get(path);
  if (!page) throw new Error(`No SEO entry for ${path}`);

  return {
    ...pageMeta({
      title: page.title,
      description: page.description,
      path: page.path,
      absoluteTitle: "absoluteTitle" in page ? page.absoluteTitle : undefined,
    }),
    ...("index" in page && page.index === false
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export function indexablePaths(): string[] {
  return publicPageSeo.filter((page) => !("index" in page)).map((page) => page.path);
}

/** Descriptions stay inside what the crop page is allowed to say. */
export function cropDescription(slug: string, summary: string): string {
  if (slug === "raktshali-rice") {
    return "Raktshali rice is growing at Ram Ganga Agro. It is not for sale.";
  }
  if (slug === "wheat") {
    return "Wheat is grown at Ram Ganga Agro. The story of this crop has not been written yet.";
  }
  return summary;
}
