import { crops } from "@/content/crops";
import { journalPosts } from "@/content/journal";
import { publicPageSeo } from "@/content/seo";
import { site } from "@/content/site";

function pageUrl(path: string): string {
  return path === "/" ? `${site.url}/` : `${site.url}${path}`;
}

/** A plain-text summary for answer engines. It repeats only published facts. */
export function GET() {
  const indexable = publicPageSeo.filter((page) => !("index" in page && page.index === false));

  const pageLinks = indexable.map(
    (page) => `- [${page.title}](${pageUrl(page.path)}): ${page.description}`,
  );

  const cropLinks = crops.map(
    (crop) => `- [${crop.name}](${pageUrl(`/grow/${crop.slug}`)}): ${crop.summary}`,
  );

  const journalLinks = journalPosts.map(
    (post) => `- [${post.title}](${pageUrl(`/journal/${post.slug}`)}): ${post.excerpt}`,
  );

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is a working farm. The canonical site is ${site.url}.`,
    "",
    "The farm practices natural farming. The method, the inputs, and a certificate have not been published.",
    "Growing a crop is not the same as selling it. Other crops are named only when the farm confirms them.",
    "The location, the size of the farm, and a founding year are not published. No certificate is claimed.",
    "The site does not sell crops. It lists no public email address and no telephone number.",
    "",
    "## Pages",
    ...pageLinks,
    "",
    "## Crops",
    ...cropLinks,
    ...(journalLinks.length > 0
      ? ["", "## Journal", ...journalLinks]
      : []),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}