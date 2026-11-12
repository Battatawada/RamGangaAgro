import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Our farm",
  description:
    "Ram Ganga Agro is a working farm. The story, the land and the practices are written by the farm.",
};

/** DRAFT holding sentences from docs/07. The farm replaces each one. */
const chapters = [
  {
    title: "Our story",
    body: "The people and the reason for the farm will be told here by the farm. Until then, this page will not guess.",
    href: "/our-farm/story",
    label: "Read our story",
  },
  {
    title: "The land",
    body: "The fields have a place. The site will name it when the farm does.",
    href: "/our-farm/the-land",
    label: "Read about the land",
  },
  {
    title: "Practices",
    body: "How the crop is grown will be described in the farm’s words, and only then.",
    href: "/our-farm/practices",
    label: "Read about practices",
  },
];

export default function OurFarmPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Our Farm" }]} />
      <div className="container-page section">
        <div className="flex items-start justify-between gap-12">
          <h1 className="type-h1">Our farm</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/mark.svg"
            alt=""
            aria-hidden="true"
            className="hidden h-16 w-16 lg:block"
          />
        </div>

        <div className="prose-page mt-12">
          {chapters.map((chapter, index) => (
            <section
              key={chapter.href}
              className={
                index > 0 ? "mt-8 border-t border-line pt-8" : undefined
              }
            >
              <h2 className="type-h2">{chapter.title}</h2>
              <p className="mt-4 text-ink-muted">{chapter.body}</p>
              <p className="mt-4">
                <Link href={chapter.href} className="text-link">
                  {chapter.label}
                </Link>
              </p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
