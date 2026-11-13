import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FieldObservation } from "@/components/story/StorySections";
import { metadataFor } from "@/content/seo";
import { fileContent } from "@/content/source";

export const metadata: Metadata = metadataFor("/our-farm/the-land");

export default function TheLandPage() {
  const land = fileContent.chapterById("farm-land");
  const note = fileContent.chapterById("farm-land-note");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "The land" }]}
        path="/our-farm/the-land"
      />
      <div className="container-page section">
        <div className="max-w-[40rem]">
          <h1 className="type-h1">{land?.title ?? "The land"}</h1>
          {land?.paragraphs.map((paragraph) => (
            <p key={paragraph} className="type-deck mt-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {note ? (
          <div className="max-w-[40rem]">
            <FieldObservation title={note.title} paragraphs={note.paragraphs} />
          </div>
        ) : null}

        <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/our-farm/practices" className="text-link">
            Natural farming
          </Link>
          <Link href="/our-farm" className="text-link">
            Back to Our farm
          </Link>
        </p>
      </div>
    </>
  );
}
