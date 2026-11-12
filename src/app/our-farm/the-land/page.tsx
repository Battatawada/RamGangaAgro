import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "The land",
  description:
    "The land will be described when the farm is ready to say where it is.",
};

export default function TheLandPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "The land" }]}
      />
      <div className="container-page section">
        <h1 className="type-h1">The land</h1>
        <div className="prose-page mt-8">
          <p className="text-ink-muted">
            The land will be described when the farm is ready to say where it
            is.
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
