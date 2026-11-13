import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CropIndex } from "@/components/CropIndex";
import { GrowingNow } from "@/components/story/StorySections";
import { pageMeta } from "@/content/meta";
import { fileContent } from "@/content/source";

export const metadata: Metadata = pageMeta({
  title: "What we grow",
  description: "Raktshali and wheat are grown at Ram Ganga Agro.",
  path: "/grow",
});

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
        <p className="prose-measure mt-6 text-ink-muted">
          A name here is a crop in the field. A sale is named only when the farm
          decides to offer that crop, and only on that crop’s page.
        </p>

        <div className="mt-4">
          {crops.length > 0 ? (
            <CropIndex crops={crops} titleAs="h2" />
          ) : (
            <p className="mt-12 text-ink-muted">The farm has not published a crop yet.</p>
          )}
        </div>

        <p className="mt-16">
          <Link href="/our-farm" className="text-link">
            Back to Our farm
          </Link>
        </p>
      </div>
    </>
  );
}
