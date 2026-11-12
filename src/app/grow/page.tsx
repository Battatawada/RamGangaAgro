import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGrid } from "@/components/ProductGrid";
import { crops } from "@/content/crops";

export const metadata: Metadata = {
  title: "What we grow",
  description: "One crop is growing at Ram Ganga Agro. It is not yet for sale.",
};

export default function GrowPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "What we grow" }]} />
      <div className="container-page section">
        <h1 className="type-h1">What we grow.</h1>
        <p className="type-deck prose-measure mt-6 text-ink-muted">
          The harvest, as it is. One crop is growing. It is not yet for sale.
        </p>

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
