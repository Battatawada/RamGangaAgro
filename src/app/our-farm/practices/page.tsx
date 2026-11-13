import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { pageMeta } from "@/content/meta";
import { fileContent } from "@/content/source";

export const metadata: Metadata = pageMeta({
  title: "Natural farming",
  description: "Ram Ganga Agro practices natural farming.",
  path: "/our-farm/practices",
});

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
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,36rem)_160px]">
          <div>
            <p className="type-eyebrow mb-5 text-green">{opening?.eyebrow}</p>
            <h1 className="type-h1">{opening?.title ?? "Natural farming."}</h1>
            {opening?.paragraphs.map((paragraph) => (
              <p key={paragraph} className="type-deck mt-6 text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
          <DecorativeMark id="seeds" className="h-20 w-44" />
        </div>

        <div className="mt-16 max-w-[40rem] lg:mt-20">
          {sections.map((section) => (
            <section key={section.id} className="border-t border-line py-8">
              <h2 className="type-h3">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-ink-muted">
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
            </section>
          ))}
        </div>

        <p className="mt-10">
          <Link href="/our-farm" className="text-link">
            Back to Our farm
          </Link>
        </p>
      </div>
    </>
  );
}
