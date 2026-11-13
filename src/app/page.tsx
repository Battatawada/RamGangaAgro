import Link from "next/link";
import { Button } from "@/components/Button";
import { FarmJourney, type JourneyStep } from "@/components/FarmJourney";
import { JournalEmpty } from "@/components/JournalEmpty";
import { MediaHero } from "@/components/MediaHero";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { SeasonalNote } from "@/components/story/StorySections";
import { getCrop } from "@/content/crops";
import { mediaById } from "@/content/media";
import { chapterById } from "@/content/story";

const journey: JourneyStep[] = [
  {
    n: "01",
    title: "The land",
    text: "Where the season starts.",
    href: "/our-farm/the-land",
  },
  {
    n: "02",
    title: "Growing",
    text: "Soil, water, and time.",
    href: "/our-farm/practices",
  },
  {
    n: "03",
    title: "Harvest",
    text: "When the field is ready.",
    href: "/grow/raktshali-rice#harvest",
  },
  {
    n: "04",
    title: "Preparation",
    text: "How the grain is handled.",
    href: "/grow/raktshali-rice#preparation",
  },
  {
    n: "05",
    title: "The table",
    text: "The harvest, brought home.",
    href: "/#follow",
  },
];

export default function HomePage() {
  const raktshali = getCrop("raktshali-rice");
  const hero = mediaById(raktshali?.mediaId ?? "panicle");
  const season = chapterById("home-season");

  return (
    <>
      {/* 1. Hero */}
      <div className="container-page grid items-end gap-12 pt-12 pb-16 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[1.15fr_0.85fr] lg:pt-[72px] lg:pb-24">
        <div className="max-w-[640px]">
          <p className="type-eyebrow mb-5 text-green">Ram Ganga Agro</p>
          <h1 className="type-display max-w-[11ch]">
            Good food begins long before the table.
          </h1>
          <p className="type-deck mt-6 max-w-[38ch] text-ink-muted">
            A farm, its crops, and the journey from the land to the table.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 max-[360px]:flex-col">
            <Button href="/our-farm">Explore our farm</Button>
            <Button href="/grow" variant="quiet">
              What we grow
            </Button>
          </div>
        </div>
        <MediaHero
          kind={hero?.kind ?? "illustration"}
          src={hero?.src ?? "/illustrations/panicle.svg"}
          alt={hero?.alt ?? ""}
          caption={hero?.caption}
          className="min-h-[320px] rounded-[2px] bg-paper-raised lg:min-h-[520px]"
          mediaClassName="max-w-[420px]"
        />
      </div>

      {/* 2. Introduction */}
      <section className="container-page section">
        <SectionHeading eyebrow="The farm" title="Every grain has a beginning." />
        <p className="prose-measure mt-6 text-ink-muted">
          Ram Ganga Agro is a working farm. This is the place to learn what is
          grown here, and how the season moves from the field toward the table.
        </p>
        <p className="mt-6">
          <Link href="/our-farm" className="text-link">
            Discover our story
          </Link>
        </p>
      </section>

      {season ? (
        <section className="container-page pb-4">
          <SeasonalNote
            eyebrow={season.eyebrow}
            title={season.title}
            paragraphs={season.paragraphs}
            mediaId={season.mediaId}
          />
        </section>
      ) : null}

      {/* 3. What we grow */}
      <section className="container-page section">
        <p className="type-eyebrow mb-5 text-green">Our harvest</p>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {raktshali ? (
            <ProductCard
              name={raktshali.name}
              summary={raktshali.summary}
              href={`/grow/${raktshali.slug}`}
              status={raktshali.status}
              media={{
                src: mediaById(raktshali.mediaId)?.src ?? "/illustrations/panicle.svg",
                alt: "",
              }}
              pricePaise={raktshali.pricePaise}
              purchasable={raktshali.purchasable}
              titleAs="p"
            />
          ) : null}
          <div>
            <h2 className="type-h2">What we grow.</h2>
            <p className="prose-measure mt-4 text-ink-muted">
              One crop is enough to begin. Another is added when the farm is
              growing it.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Journey */}
      <section className="container-page section">
        <SectionHeading
          eyebrow="From the land to the table"
          title="Five steps, and no more than we can stand behind."
        />
        <div className="mt-10">
          <FarmJourney steps={journey} />
        </div>
        <DecorativeMark id="contours" className="mt-8 h-28 w-full object-cover" />
      </section>

      {/* 5. Raktshali band */}
      <div className="bg-green text-paper">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <hr className="mb-6 h-px w-12 border-0 bg-raktshali" />
            <p className="type-eyebrow mb-5 text-paper">Raktshali</p>
            <h2 className="type-h2">Raktshali, still in the field.</h2>
          </div>
          <div>
            <p className="prose-measure">
              This rice is growing at Ram Ganga Agro. It is not for sale. The
              page names the crop and leaves room for the farm’s own account.
            </p>
            <p className="mt-6">
              <Link
                href="/grow/raktshali-rice"
                className="text-paper underline underline-offset-[3px]"
              >
                Read the crop’s story
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 6. Journal */}
      <section className="container-page section">
        <p className="type-eyebrow mb-5 text-green">From the farm</p>
        <JournalEmpty />
      </section>

      {/* 7. Follow */}
      <section id="follow" className="container-page section">
        <div className="grid items-end gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Harvest notes" title="Follow the journey." />
            <p className="prose-measure mt-6 text-ink-muted">
              A note when there is something to say about the season, and when a
              harvest is ready to leave the farm. Nothing else.
            </p>
          </div>
          <NewsletterForm source="homepage" />
        </div>
      </section>
    </>
  );
}
