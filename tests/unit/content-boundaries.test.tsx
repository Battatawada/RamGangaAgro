import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { SeasonalNote } from "@/components/story/StorySections";
import { crops } from "@/content/crops";
import { media } from "@/content/media";
import { storyChapters } from "@/content/story";

const forbidden = ["red rice", "traditional", "organic", "certified", "testimonial", "acres"];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => readFileSync(join(directory, name), "utf8"));
}

describe("public content boundaries", () => {
  it("does not invent farm facts in the content modules", () => {
    const combined = sourceFiles("src/content").join("\n").toLowerCase();
    for (const phrase of forbidden) {
      expect(combined, phrase).not.toContain(phrase);
    }
  });

  it("keeps each crop inside what the farm has confirmed", () => {
    const raktshali = crops.find((crop) => crop.slug === "raktshali-rice");
    const wheat = crops.find((crop) => crop.slug === "wheat");

    expect(raktshali?.name).toBe("Raktshali rice");
    expect(raktshali?.summary).toBe("Grown at Ram Ganga Agro. It is not for sale.");
    expect(raktshali?.status).toBe("currently_growing");
    expect(raktshali?.purchasable).toBe(false);
    expect(raktshali?.productSlug).toBeNull();
    expect(raktshali?.story).toBeNull();
    expect(raktshali?.season).toBeNull();

    expect(wheat?.name).toBe("Wheat");
    expect(wheat?.summary).toBe("Grown at Ram Ganga Agro.");
    expect(wheat?.status).toBeNull();
    expect(wheat?.purchasable).toBe(false);
    expect(wheat?.productSlug).toBeNull();
    expect(wheat?.season).toBeNull();
    expect(wheat?.pricePaise).toBeNull();
    expect(wheat?.availability.paragraphs.join(" ")).not.toContain("for sale");
  });

  it("marks drawings that are not photographs as decorative or labelled", () => {
    for (const asset of Object.values(media)) {
      if (asset.kind === "illustration" && !("decorative" in asset && asset.decorative)) {
        expect(asset.alt.toLowerCase()).toContain("illustration");
      }
    }
  });

  it("renders a seasonal gap without a factual claim", () => {
    const html = renderToStaticMarkup(
      <SeasonalNote
        title="The story is still being written."
        paragraphs={["More from the field soon."]}
      />,
    );
    expect(html).toContain("The story is still being written.");
    expect(html).toContain("More from the field soon.");
    expect(html).toContain('aria-hidden="true"');
    expect(html.toLowerCase()).not.toContain("red rice");
  });

  it("does not announce a decorative mark", () => {
    const html = renderToStaticMarkup(<DecorativeMark id="grain" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('alt=""');
  });

  it("keeps placeholder chapters free of measurements", () => {
    const placeholders = storyChapters.filter((chapter) => chapter.status === "placeholder");
    expect(placeholders.length).toBeGreaterThan(0);
    const text = placeholders
      .flatMap((chapter) => [chapter.title, ...chapter.paragraphs])
      .join(" ")
      .toLowerCase();
    expect(text).not.toMatch(/\d+\s*(acre|hectare|kg|ton)/);
  });
});
