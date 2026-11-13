import { crops } from "@/content/crops";
import { site } from "@/content/site";
import { indexablePaths } from "@/content/seo";

/** A plain-text summary for answer engines. It repeats only published facts. */
export function GET() {
  const cropLines = crops.map((crop) => `- ${crop.name}: ${crop.summary}`);
  const pages = [
    ...indexablePaths(),
    ...crops.map((crop) => `/grow/${crop.slug}`),
  ].map((path) => `- ${path === "/" ? site.url : `${site.url}${path}`}`);

  const body = [
    `# ${site.name}`,
    "",
    `${site.name} is a working farm. The canonical site is ${site.url}.`,
    "",
    "The farm practices natural farming. The work in the field has not been described yet.",
    ...cropLines,
    "Other crops are named only when the farm confirms them.",
    "",
    "The location, the size of the farm, and a founding year are not published. No certificate is claimed. The site does not sell crops. It lists no public email address and no telephone number.",
    "",
    "Pages:",
    ...pages,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
