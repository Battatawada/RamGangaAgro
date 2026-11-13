import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { OpeningThought, WhatComesNext } from "@/components/story/StorySections";
import { fileContent } from "@/content/source";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "The story of Ram Ganga Agro will be published in the farm’s own words.",
};

export default function StoryPage() {
  const opening = fileContent.chapterById("farm-story");
  const next = fileContent.chapterById("farm-story-gap");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "Our story" }]}
      />
      <div className="container-page section">
        {opening ? (
          <OpeningThought
            title={opening.title}
            paragraphs={opening.paragraphs}
            href={opening.href}
            linkLabel={opening.linkLabel}
          />
        ) : null}
        {next ? (
          <WhatComesNext
            title={next.title}
            paragraphs={next.paragraphs}
            href={next.href}
            linkLabel={next.linkLabel}
          />
        ) : null}
      </div>
    </>
  );
}
