import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HarvestStatus } from "@/components/HarvestStatus";
import { MediaFrame } from "@/components/MediaFrame";
import { cropPanelClass } from "@/content/crops";
import { mediaById, type MediaAsset } from "@/content/media";
import { pageMeta } from "@/content/meta";
import { fileContent } from "@/content/source";

type Params = { params: Promise<{ slug: string }> };

// No generateStaticParams: the strict CSP nonce makes every page render on
// the request anyway, and a prerendered shell would 500 on an unknown slug
// instead of answering 404.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const crop = fileContent.getCrop(slug);
  if (!crop) return {};
  return pageMeta({
    title: crop.name,
    description: crop.summary,
    path: `/grow/${crop.slug}`,
  });
}

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-ink-muted">
          {paragraph}
        </p>
      ))}
    </>
  );
}

function isAsset(value: MediaAsset | undefined): value is MediaAsset {
  return value !== undefined;
}

export default async function CropPage({ params }: Params) {
  const { slug } = await params;
  const crop = fileContent.getCrop(slug);
  if (!crop) notFound();

  const hero = mediaById(crop.heroMediaId);
  const notes = fileContent.postsForCrop(crop.slug);
  const siblings = fileContent.otherCrops(crop.slug);
  const photographs = crop.photographIds.map((id) => mediaById(id)).filter(isAsset);
  const field = crop.fieldMediaId ? mediaById(crop.fieldMediaId) : undefined;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "What we grow", href: "/grow" },
          { label: crop.name },
        ]}
      />

      <div className="container-page grid items-end gap-10 pt-8 pb-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)] lg:gap-16 lg:pb-20">
        <div className="max-w-[36rem] lg:pb-6">
          {crop.status ? <HarvestStatus status={crop.status} /> : null}
          <h1 className="type-h1 mt-3">{crop.name}</h1>
          <p className="type-deck mt-5 text-ink-muted">{crop.summary}</p>
          {crop.season ? (
            <p className="mt-4 text-ink-muted">Season: {crop.season}</p>
          ) : null}
        </div>
        <figure className="m-0">
          <div className={`flex justify-center px-8 py-10 ${cropPanelClass[crop.tone]}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero?.src ?? "/illustrations/panicle.svg"}
              alt={hero?.alt ?? ""}
              className="h-auto w-[min(100%,300px)]"
            />
          </div>
          <figcaption className="type-caption mt-3">
            {hero?.caption ?? "A drawing, not a photograph."}
          </figcaption>
        </figure>
      </div>

      <div className="container-page pb-16">
        {photographs.length > 0 || field?.kind === "image" ? (
          <ul className="mb-16 grid list-none gap-8 p-0 md:grid-cols-2">
            {field?.kind === "image" ? (
              <li>
                <MediaFrame asset={field} aspect="landscape" />
              </li>
            ) : null}
            {photographs.map((asset) => (
              <li key={asset.id}>
                <MediaFrame
                  asset={asset}
                  aspect={asset.kind === "image" ? "landscape" : "detail"}
                />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="prose-page">
          {crop.description ? (
            <section className="mb-16">
              <h2 className="type-h2">{crop.essayTitle}</h2>
              <Prose paragraphs={crop.description} />
              {crop.facts ? (
                <dl className="mt-8">
                  {crop.facts.map((fact) => (
                    <div
                      key={fact.label}
                      className="grid gap-2 border-t border-line py-4 sm:grid-cols-[180px_1fr] sm:gap-4"
                    >
                      <dt className="text-sm text-clay-deep">{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ) : null}

          <section className="mb-16">
            <h2 className="type-h2">The story.</h2>
            {crop.story ? (
              <Prose paragraphs={crop.story} />
            ) : (
              <p className="mt-4 text-ink-muted">The story is still being written.</p>
            )}
          </section>

          {crop.chapters.map((chapter) =>
            chapter.paragraphs ? (
              <section key={chapter.id} className="mb-16">
                <h2 className="type-h2">{chapter.title}</h2>
                <Prose paragraphs={chapter.paragraphs} />
              </section>
            ) : null,
          )}

          {crop.onThisFarm ? (
            <section className="mb-16">
              <h2 className="type-h2">On this farm.</h2>
              <Prose paragraphs={crop.onThisFarm} />
            </section>
          ) : null}

          {crop.inTheField ? (
            <section className="mb-16">
              <h2 className="type-h2">In the field.</h2>
              <Prose paragraphs={crop.inTheField} />
            </section>
          ) : null}

          {crop.updates.length > 0 ? (
            <section className="mb-16">
              <h2 className="type-h2">Growing updates.</h2>
              {crop.updates.map((update) => (
                <div key={update.title} className="mt-8 border-t border-line pt-6">
                  <h3 className="type-h3">{update.title}</h3>
                  <Prose paragraphs={update.paragraphs} />
                </div>
              ))}
            </section>
          ) : null}

          {crop.observations ? (
            <section className="mb-16">
              <h2 className="type-h2">Observations.</h2>
              <Prose paragraphs={crop.observations} />
            </section>
          ) : null}

          {crop.harvest ? (
            <section id="harvest" className="mb-16 scroll-mt-24">
              <h2 className="type-h2">Harvest.</h2>
              <Prose paragraphs={crop.harvest} />
            </section>
          ) : null}

          {crop.preparation ? (
            <section id="preparation" className="mb-16 scroll-mt-24">
              <h2 className="type-h2">Preparation.</h2>
              <Prose paragraphs={crop.preparation} />
            </section>
          ) : null}

          {crop.laterNote ? (
            <section className="mb-16">
              <h2 className="type-h2">From this harvest, later.</h2>
              <Prose paragraphs={crop.laterNote} />
            </section>
          ) : null}

          {notes.length > 0 ? (
            <section className="mb-16">
              <h2 className="type-h2">Notes.</h2>
              <ul className="mt-4 list-none p-0">
                {notes.map((post) => (
                  <li key={post.slug} className="border-t border-line py-4">
                    <Link href={`/journal/${post.slug}`} className="text-link">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="border-t border-line pt-8">
            <h2 className="type-h2">{crop.availability.title}</h2>
            <Prose paragraphs={crop.availability.paragraphs} />
            <p className="mt-4">
              <Link href="/#follow" className="text-link">
                Follow the farm
              </Link>
            </p>
          </section>

          {siblings.length > 0 ? (
            <section className="mt-16">
              <h2 className="type-h2">Also grown here.</h2>
              <ul className="mt-4 list-none p-0">
                {siblings.map((sibling) => (
                  <li key={sibling.slug} className="border-t border-line py-4">
                    <Link href={`/grow/${sibling.slug}`} className="text-link">
                      {sibling.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-12">
            <Link href="/grow" className="text-link">
              All crops
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
