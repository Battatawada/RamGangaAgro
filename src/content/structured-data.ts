import { site } from "@/content/site";

type ListItem = {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
};

/**
 * Name and URL only. Address, hours, ratings, telephone, and price are not
 * confirmed, so they are not included.
 */
export function publicStructuredData() {
  const organizationId = `${site.url}/#organization`;
  const websiteId = `${site.url}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: site.name,
        url: site.url,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: site.name,
        url: site.url,
      },
    ],
  };
}

export function breadcrumbStructuredData(
  items: { label: string; href?: string }[],
  path: string,
) {
  const trail = [{ label: site.name, href: "/" }, ...items];
  const itemListElement: ListItem[] = trail.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.href
      ? new URL(item.href, site.url).href
      : new URL(path, site.url).href,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
