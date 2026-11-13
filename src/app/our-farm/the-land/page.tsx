import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FieldObservation, FromTheLand } from "@/components/story/StorySections";
import { fileContent } from "@/content/source";

export const metadata: Metadata = {
  title: "The land",
  description:
    "The land will be described when the farm is ready to say where it is.",
};

export default function TheLandPage() {
  const land = fileContent.chapterById("farm-land");
  const note = fileContent.chapterById("farm-land-note");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "The land" }]}
      />
      <div className="container-page section">
        {land ? (
          <FromTheLand
            title={land.title}
            paragraphs={land.paragraphs}
            mediaId={land.mediaId}
          />
        ) : null}
        {note ? <FieldObservation title={note.title} paragraphs={note.paragraphs} /> : null}
        <p className="mt-10">
          <Link href="/our-farm" className="text-link">
            Back to Our farm
          </Link>
        </p>
      </div>
    </>
  );
}
