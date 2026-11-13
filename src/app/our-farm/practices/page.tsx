import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OpeningThought, SeasonalNote } from "@/components/story/StorySections";
import { fileContent } from "@/content/source";

export const metadata: Metadata = {
  title: "Practices",
  description:
    "Farming practices will be described here only when the farm has confirmed them.",
};

export default function PracticesPage() {
  const opening = fileContent.chapterById("farm-practices");
  const note = fileContent.chapterById("farm-practices-gap");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "Practices" }]}
      />
      <div className="container-page section">
        {opening ? (
          <OpeningThought title={opening.title} paragraphs={opening.paragraphs} />
        ) : null}
        {note ? (
          <div className="mt-10 max-w-[40rem]">
            <SeasonalNote title={note.title} paragraphs={note.paragraphs} />
          </div>
        ) : null}
        <p className="mt-10">
          <Link href="/our-farm" className="text-link">
            Back to Our farm
          </Link>
        </p>
      </div>
    </>
  );
}
