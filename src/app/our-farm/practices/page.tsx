import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { fileContent } from "@/content/source";

export const metadata: Metadata = {
  title: "Natural farming",
  description: "Ram Ganga Agro practices natural farming.",
};

export default function PracticesPage() {
  const opening = fileContent.chapterById("farm-practices");
  const sections = fileContent
    .chaptersFor("practices")
    .filter((chapter) => chapter.id !== "farm-practices");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Our Farm", href: "/our-farm" }, { label: "Practices" }]}
      />
      <div className="container-page section">
        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-[40rem]">
            <p className="type-eyebrow mb-5 text-green">{opening?.eyebrow}</p>
            <h1 className="type-h1">{opening?.title ?? "Natural farming."}</h1>
            {opening?.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="type-deck mt-6 text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
          <div>
            <DecorativeMark id="seeds" className="h-16 w-48" />
            <DecorativeMark id="seasonal-line" className="mt-8 h-8 w-full" />
          </div>
        </div>

        <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-2">
          {sections.map((section) => (
            <section key={section.id} className="border-t border-green pt-6">
              <h2 className="type-h3">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-ink-muted">
                  {paragraph}
                </p>
              ))}
              {section.href && section.linkLabel ? (
                <p className="mt-4">
                  <Link href={section.href} className="text-link">
                    {section.linkLabel}
                  </Link>
                </p>
              ) : null}
              {section.mediaId ? (
                <DecorativeMark id={section.mediaId} className="mt-8 h-24 w-full object-cover" />
              ) : null}
            </section>
          ))}
        </div>

        <p className="mt-16">
          <Link href="/our-farm" className="text-link">
            Back to Our farm
          </Link>
        </p>
      </div>
    </>
  );
}
