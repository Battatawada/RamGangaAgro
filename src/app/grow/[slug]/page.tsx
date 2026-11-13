import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HarvestStatus } from "@/components/HarvestStatus";
import { MediaHero } from "@/components/MediaHero";
import { CropChapter } from "@/components/story/StorySections";
import { getCrop } from "@/content/crops";
import { mediaById } from "@/content/media";

type Params = { params: Promise<{ slug: string }> };

// No generateStaticParams: the strict CSP nonce makes every page render on
// the request anyway, and a prerendered shell would 500 on an unknown slug
// instead of answering 404.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const crop = getCrop(slug);
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
  const crop = getCrop(slug);
  if (!crop) notFound();
  const hero = mediaById(crop.mediaId) ?? mediaById("panicle");

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "What we grow", href: "/grow" },
          { label: crop.name },
        ]}
      />

      {/* 1. Opener */}
      <div className="container-page grid items-end gap-12 pt-8 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
        <div>
          <HarvestStatus status={crop.status} />
          <h1 className="type-h1 mt-2">{crop.name}</h1>
          <p className="type-deck mt-4 text-ink-muted">{crop.summary}</p>
        </div>
        <MediaHero
          kind={hero?.kind ?? "illustration"}
          src={hero?.src ?? "/illustrations/panicle.svg"}
          alt={
            hero?.decorative
              ? "Line drawing of a rice panicle, standing in for a photograph of the crop."
              : (hero?.alt ?? "")
          }
          caption={hero?.caption ?? "A drawing, not a photograph."}
          className="min-h-[300px] rounded-[2px] bg-raktshali-soft lg:min-h-[460px]"
          mediaClassName="max-w-[280px]"
        />
      </div>

      <div className="container-page prose-page pb-16">
        {/* 2. What it is. Omitted until the farm writes it. */}
        {crop.description ? (
          <section className="mb-16">
            <h2 className="type-h2">The rice.</h2>
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

        {/* 3. On this farm. Omitted until the farm answers why. */}
        {crop.onThisFarm ? (
          <section className="mb-16">
            <h2 className="type-h2">On this farm.</h2>
            <Prose paragraphs={crop.onThisFarm} />
          </section>
        ) : null}

        {/* 4. In the field. Omitted until there is a paragraph or a picture. */}
        {crop.inTheField ? (
          <section className="mb-16">
            <h2 className="type-h2">In the field.</h2>
            <Prose paragraphs={crop.inTheField} />
          </section>
        ) : null}

        <CropChapter
          id="harvest"
          title="Harvest."
          paragraphs={crop.harvest}
          empty="When a harvest is recorded, its season will be named here."
        />

        {/* 6. Preparation. Omitted until the farm describes it. */}
        {crop.preparation ? (
          <section id="preparation" className="mb-16 scroll-mt-24">
            <h2 className="type-h2">Preparation.</h2>
            <Prose paragraphs={crop.preparation} />
          </section>
        ) : null}

        {/* 7. From this harvest, later */}
        <section className="mb-16">
          <h2 className="type-h2">From this harvest, later.</h2>
          <p className="mt-4 text-ink-muted">
            In time, a pack may carry a code. That code will open the record of
            the harvest it came from: the crop, the date, and what the farm
            chooses to share.
          </p>
        </section>

        {/* 8. Availability */}
        <section className="surface p-7">
          <h2 className="type-h2">Harvest notes, when the grain is ready.</h2>
          <p className="mt-4 text-ink-muted">
            This rice is not available to buy. If you want to hear when that
            changes, follow the farm.
          </p>
          <p className="mt-4">
            <Link href="/#follow" className="text-link">
              Follow the farm
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
