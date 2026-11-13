import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/content/meta";
import { fileContent } from "@/content/source";

export const metadata: Metadata = pageMeta({
  title: "Our farm",
  description:
    "Ram Ganga Agro is a working farm. The story, the land, and the practice are told as the farm shares them.",
  path: "/our-farm",
});

export default function OurFarmPage() {
  const opening = fileContent.chapterById("farm-opening");
  const chapters = fileContent.chaptersFor("farm-index");

  return (
    <>
      <Breadcrumbs items={[{ label: "Our Farm" }]} />
      <div className="container-page section">
        <div className="max-w-[40rem]">
          {opening?.eyebrow ? (
            <p className="type-eyebrow mb-5 text-green">{opening.eyebrow}</p>
          ) : null}
          <h1 className="type-h1">{opening?.title ?? "Our farm"}</h1>
          {opening?.paragraphs.map((paragraph) => (
            <p key={paragraph} className="type-deck mt-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>

        <ul className="mt-16 grid list-none gap-x-16 gap-y-12 p-0 md:grid-cols-2 lg:mt-20">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="border-t border-line pt-6">
              <h2 className="type-h3">{chapter.title}</h2>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 max-w-[36ch] text-ink-muted">
                  {paragraph}
                </p>
              ))}
              {chapter.href && chapter.linkLabel ? (
                <p className="mt-4">
                  <Link href={chapter.href} className="text-link">
                    {chapter.linkLabel}
                  </Link>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
