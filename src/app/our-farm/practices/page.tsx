import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Practices",
  description:
    "Farming practices will be described here only when the farm has confirmed them.",
};

export default function PracticesPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "Practices" }]}
      />
      <div className="container-page section">
        <h1 className="type-h1">Practices</h1>
        <div className="prose-page mt-8">
          <p className="text-ink-muted">
            Farming practices will be described here only when the farm has
            confirmed them.
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
