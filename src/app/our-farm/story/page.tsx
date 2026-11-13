import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JourneyAhead, WhatComesNext } from "@/components/story/StorySections";
import { pageMeta } from "@/content/meta";
import { fileContent } from "@/content/source";

export const metadata: Metadata = pageMeta({
  title: "Our story",
  description:
    "The story of Ram Ganga Agro will be published in the farm’s own words.",
  path: "/our-farm/story",
});

export default function StoryPage() {
  const opening = fileContent.chapterById("farm-story");
  const next = fileContent.chapterById("farm-story-gap");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "Our story" }]}
      />
      <div className="container-page section">
        <div className="max-w-[40rem]">
            <h1 className="type-h1">{opening?.title ?? "Our story"}</h1>
            {opening?.paragraphs.map((paragraph) => (
              <p key={paragraph} className="type-deck mt-6 text-ink-muted">
                {paragraph}
              </p>
            ))}
            {opening?.href && opening.linkLabel ? (
              <p className="mt-6">
                <Link href={opening.href} className="text-link">
                  {opening.linkLabel}
                </Link>
              </p>
            ) : null}
        </div>

        {next ? (
          <WhatComesNext
            title={next.title}
            paragraphs={next.paragraphs}
            href={next.href}
            linkLabel={next.linkLabel}
          />
        ) : null}

        <div className="mt-16 max-w-[40rem]">
          <JourneyAhead
            title="Elsewhere on the farm."
            steps={[
              {
                href: "/our-farm/the-land",
                label: "The land",
                text: "The place, when the farm names it.",
              },
              {
                href: "/our-farm/practices",
                label: "Natural farming",
                text: "Ram Ganga Agro practices natural farming.",
              },
              {
                href: "/grow",
                label: "What we grow",
                text: "Raktshali and wheat, and room for the next name.",
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
