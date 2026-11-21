import { crops } from "@/content/crops";
import { farmLocation, publicContact } from "@/content/contact-config";
import { listDiscoveryPaths } from "@/content/discovery-paths";
import { journalPosts } from "@/content/journal";
import { publicPageSeo } from "@/content/seo";
import { site } from "@/content/site";

const seoByPath = new Map(publicPageSeo.map((page) => [page.path, page]));

function pageUrl(path: string): string {
  return path === "/" ? `${site.url}/` : `${site.url}${path}`;
}

function contactFacts(): string[] {
  const lines: string[] = [];
  if (publicContact.email) {
    lines.push(`Public email: ${publicContact.email}`);
  }
  if (publicContact.phone) {
    lines.push(`Telephone: ${publicContact.phone}`);
  }
  if (lines.length === 0) {
    lines.push(
      "Use the contact form on the contact page for enquiries. No public email address or telephone is listed on the site.",
    );
  }
  return lines;
}

/** A plain-text summary for answer engines. It repeats only published facts. */
export async function GET() {
  const paths = await listDiscoveryPaths();

  const pageLinks = paths
    .map((path) => {
      const page = seoByPath.get(path as (typeof publicPageSeo)[number]["path"]);
      if (page) {
        return `- [${page.title}](${pageUrl(path)}): ${page.description}`;
      }

      const crop = crops.find((entry) => `/grow/${entry.slug}` === path);
      if (crop) {
        return `- [${crop.name}](${pageUrl(path)}): ${crop.summary}`;
      }

      const post = journalPosts.find((entry) => `/journal/${entry.slug}` === path);
      if (post) {
        return `- [${post.title}](${pageUrl(path)}): ${post.excerpt}`;
      }

      return null;
    })
    .filter((line): line is string => line !== null);

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is a working farm at ${farmLocation}. The canonical site is ${site.url}.`,
    "",
    "The farm grows Raktshali (Rakthashali) rice and wheat and practices natural farming.",
    "A named crop is in the field, not necessarily for sale. Nothing on this site is offered for sale yet.",
    "Farm size, founding year, and certification claims are not published unless a page states them.",
    ...contactFacts(),
    "",
    "## Indexable pages",
    "These URLs match the site sitemap and are intended for search indexing:",
    ...pageLinks,
    "",
    `Sitemap: ${site.url}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}