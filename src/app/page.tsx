import Link from "next/link";
import { Button } from "@/components/Button";
import { FarmJourney, type JourneyStep } from "@/components/FarmJourney";
import { JournalEmpty } from "@/components/JournalEmpty";
import { MediaHero } from "@/components/MediaHero";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import { fileContent } from "@/content/source";
import { mediaById } from "@/content/media";

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
    href: "/grow",
  },
  {
    n: "04",
    title: "Preparation",
    text: "How the grain is handled.",
    href: "/our-farm/practices",
  },
  {
    n: "05",
    title: "The table",
    text: "The harvest, brought home.",
    href: "/#follow",
  },
];

export default function HomePage() {
  const crops = fileContent.listCrops();
  const intro = fileContent.chapterById("home-intro");
  const natural = fileContent.chapterById("home-natural");
  const wheat = fileContent.chapterById("home-wheat");
  const hero = mediaById("panicle");
  const wheatDrawing = mediaById("wheat");

  return (
    <>
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
        <div>
          <MediaHero
            kind={hero?.kind ?? "illustration"}
            src={hero?.src ?? "/illustrations/panicle.svg"}
            alt={hero?.alt ?? ""}
            caption={hero?.caption}
            className="min-h-[280px] rounded-[2px] bg-paper-raised lg:min-h-[460px]"
            mediaClassName="max-w-[420px]"
          />
          {wheatDrawing ? (
            <div className="mt-4 flex items-end gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wheatDrawing.src}
                alt={wheatDrawing.alt}
                className="h-20 w-auto"
              />
              <p className="type-caption max-w-[24ch]">
                Wheat. A drawing, not a photograph.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {intro ? (
        <section className="container-page section">
          <SectionHeading eyebrow={intro.eyebrow} title={intro.title} />
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph} className="prose-measure mt-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
          {intro.href && intro.linkLabel ? (
            <p className="mt-6">
              <Link href={intro.href} className="text-link">
                {intro.linkLabel}
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {natural ? (
        <section className="container-page section pt-0">
          <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-[40rem]">
              <p className="type-eyebrow mb-5 text-green">{natural.eyebrow}</p>
              <h2 className="type-h2 max-w-[16ch]">{natural.title}</h2>
              {natural.paragraphs.map((paragraph) => (
                <p key={paragraph} className="prose-measure mt-6 text-ink-muted">
                  {paragraph}
                </p>
              ))}
              {natural.href && natural.linkLabel ? (
                <p className="mt-6">
                  <Link href={natural.href} className="text-link">
                    {natural.linkLabel}
                  </Link>
                </p>
              ) : null}
            </div>
            <div>
              <DecorativeMark id="seeds" className="h-14 w-44" />
              <DecorativeMark id="field-divider" className="mt-6 h-8 w-full" />
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page section">
        <SectionHeading
          eyebrow="Our harvest"
          title="What we grow."
          lede="Raktshali and wheat each have a page. Another crop joins them when the farm confirms its name."
        />
        <ul className="mt-12 grid list-none gap-x-16 gap-y-10 p-0 lg:grid-cols-2">
          {crops.map((crop) => (
            <li key={crop.slug}>
              <ProductCard
                name={crop.name}
                summary={crop.summary}
                href={`/grow/${crop.slug}`}
                status={crop.status}
                tone={crop.tone}
                media={{
                  src: mediaById(crop.mediaId)?.src ?? "/illustrations/panicle.svg",
                  alt: mediaById(crop.mediaId)?.alt ?? "",
                }}
                pricePaise={crop.pricePaise}
                purchasable={crop.purchasable}
                layout="editorial"
                titleAs="h3"
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="bg-green text-paper">
        <div className="container-page grid items-end gap-12 py-16 lg:grid-cols-2 lg:py-24">
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

      {wheat ? (
        <section className="container-page section">
          <div className="grid items-end gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="grid min-h-[280px] place-items-center bg-paper-raised px-6">
              {wheat.mediaId ? (
                // Meaningful drawing: the alt comes from the media record.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaById(wheat.mediaId)?.src}
                  alt={mediaById(wheat.mediaId)?.alt ?? ""}
                  className="h-auto w-[min(70%,200px)]"
                />
              ) : null}
            </div>
            <div>
              <hr className="mb-6 h-px w-12 border-0 bg-grain" />
              <p className="type-eyebrow mb-5 text-green">{wheat.eyebrow}</p>
              <h2 className="type-h2">{wheat.title}</h2>
              {wheat.paragraphs.map((paragraph) => (
                <p key={paragraph} className="prose-measure mt-4 text-ink-muted">
                  {paragraph}
                </p>
              ))}
              {wheat.href && wheat.linkLabel ? (
                <p className="mt-6">
                  <Link href={wheat.href} className="text-link">
                    {wheat.linkLabel}
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page section pt-0">
        <SectionHeading
          eyebrow="From the land to the table"
          title="Five steps, and no more than we can stand behind."
        />
        <div className="mt-10">
          <FarmJourney steps={journey} />
        </div>
        <DecorativeMark id="contours" className="mt-8 h-28 w-full object-cover" />
      </section>

      <section className="container-page section">
        <p className="type-eyebrow mb-5 text-green">From the farm</p>
        <JournalEmpty />
      </section>

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
