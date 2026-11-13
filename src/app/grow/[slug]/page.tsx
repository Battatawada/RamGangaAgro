import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HarvestStatus } from "@/components/HarvestStatus";
import { MediaHero } from "@/components/MediaHero";
import { CropChapter } from "@/components/story/StorySections";
import { cropPanelClass } from "@/content/crops";
import { mediaById } from "@/content/media";
import { fileContent } from "@/content/source";

type Params = { params: Promise<{ slug: string }> };

// No generateStaticParams: the strict CSP nonce makes every page render on
// the request anyway, and a prerendered shell would 500 on an unknown slug
// instead of answering 404.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const crop = fileContent.getCrop(slug);
  if (!crop) return {};
  return { title: crop.name, description: crop.summary };
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

export default async function CropPage({ params }: Params) {
  const { slug } = await params;
  const crop = fileContent.getCrop(slug);
  if (!crop) notFound();
  const hero = mediaById(crop.heroMediaId);
  const notes = fileContent.postsForCrop(crop.slug);
  const siblings = fileContent.otherCrops(crop.slug);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "What we grow", href: "/grow" },
          { label: crop.name },
        ]}
      />

      <div className="container-page grid items-end gap-12 pt-8 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
        <div>
          {crop.status ? <HarvestStatus status={crop.status} /> : null}
          <h1 className="type-h1 mt-2">{crop.name}</h1>
          <p className="type-deck mt-4 text-ink-muted">{crop.summary}</p>
          {crop.season ? (
            <p className="mt-4 text-ink-muted">Season: {crop.season}</p>
          ) : null}
        </div>
        <MediaHero
          kind={hero?.kind ?? "illustration"}
          src={hero?.src ?? "/illustrations/panicle.svg"}
          alt={hero?.alt ?? ""}
          caption={hero?.caption ?? "A drawing, not a photograph."}
          className={`min-h-[300px] rounded-[2px] lg:min-h-[460px] ${cropPanelClass[crop.tone]}`}
          mediaClassName="max-w-[280px]"
        />
      </div>

      <div className="container-page prose-page pb-16">
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
        ) : (
          <section className="mb-16">
            <h2 className="type-h2">In the field.</h2>
            <p className="mt-4 text-ink-muted">More from the field soon.</p>
          </section>
        )}

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

        <CropChapter
          id="harvest"
          title="Harvest."
          paragraphs={crop.harvest}
          empty="When a harvest is recorded, its season will be named here."
        />

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

        <section className="mb-16">
          <h2 className="type-h2">Notes.</h2>
          {notes.length > 0 ? (
            <ul className="mt-4 list-none p-0">
              {notes.map((post) => (
                <li key={post.slug} className="border-t border-line py-4">
                  <Link href={`/journal/${post.slug}`} className="text-link">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ink-muted">More from the field soon.</p>
          )}
        </section>

        <section className="surface p-7">
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
      </div>
    </>
  );
}
