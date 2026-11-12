import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "The story of Ram Ganga Agro will be published in the farm’s own words.",
};

export default function StoryPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "Our story" }]}
      />
      <div className="container-page section">
        <h1 className="type-h1">Our story</h1>
        <div className="prose-page mt-8">
          <p className="text-ink-muted">
            The story of Ram Ganga Agro will be published in the farm’s own
            words.
          </p>
          <p className="mt-6">
            <Link href="/grow" className="text-link">
              What we grow
            </Link>
          </p>
          <p className="mt-10">
            <Link href="/our-farm" className="text-link">
              Back to Our farm
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
