import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGrid } from "@/components/ProductGrid";
import { GrowingNow } from "@/components/story/StorySections";
import { fileContent } from "@/content/source";

export const metadata: Metadata = {
  title: "What we grow",
  description: "One crop is growing at Ram Ganga Agro. It is not yet for sale.",
};

export default function GrowPage() {
  const crops = fileContent.listCrops();
  const intro = fileContent.chapterById("grow-now");

  return (
    <>
      <Breadcrumbs items={[{ label: "What we grow" }]} />
      <div className="container-page section">
        {intro ? (
          <GrowingNow title={intro.title} paragraphs={intro.paragraphs} />
        ) : (
          <h1 className="type-h1">What we grow.</h1>
        )}

        <div className="mt-12">
          {crops.length > 0 ? (
            <ProductGrid crops={crops} />
          ) : (
            <p className="text-ink-muted">
              The farm has not published a crop yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
