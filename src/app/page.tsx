import Link from "next/link";
import { Button } from "@/components/Button";
import { FarmJourney } from "@/components/FarmJourney";
import { HeroPlate } from "@/components/HeroPlate";
import { JournalEmpty } from "@/components/JournalEmpty";
import { NewsletterForm } from "@/components/NewsletterForm";
import { HarvestStatus } from "@/components/HarvestStatus";
import { mediaById } from "@/content/media";
import { metadataFor } from "@/content/seo";
import { fileContent, landToTable } from "@/content/source";
import type { Crop } from "@/content/crops";

export const metadata = metadataFor("/");

function CropSpread({ crop }: { crop: Crop }) {
  const drawing = mediaById(crop.mediaId);
  const image = drawing ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={drawing.src}
      alt={drawing.alt}
      className="mx-auto h-auto w-[220px] sm:w-[260px]"
    />
  ) : null;

  if (crop.tone === "raktshali") {
    return (
      <section className="bg-raktshali-soft">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16 lg:py-24">
          <div className="max-w-[36rem]">
            <hr className="mb-6 h-px w-12 border-0 bg-raktshali" />
            {crop.status ? <HarvestStatus status={crop.status} /> : null}
            <h2 className="type-h2 mt-3 max-w-[14ch]">Raktshali, still in the field.</h2>
            <p className="mt-6 max-w-[38ch] text-ink-muted">
              Raktshali is growing at Ram Ganga Agro. It is not for sale. The
              page holds the name, and room for the farm’s own account.
            </p>
            <p className="mt-6">
              <Link href={`/grow/${crop.slug}`} className="text-link">
                Read the crop’s story
              </Link>
            </p>
          </div>
          {image}
        </div>
      </section>
    );
  }

  if (crop.tone === "wheat") {
    return (
      <section className="container-page grid items-center gap-10 py-16 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 lg:py-24">
        {image}
        <div className="max-w-[36rem]">
          <hr className="mb-6 h-px w-12 border-0 bg-grain" />
          <p className="type-eyebrow mb-5 text-green">Wheat</p>
          <h2 className="type-h2">Wheat, grown here.</h2>
          <p className="mt-6 max-w-[38ch] text-ink-muted">
            Wheat is grown at Ram Ganga Agro. The story is still being written.
          </p>
          <p className="mt-6">
            <Link href={`/grow/${crop.slug}`} className="text-link">
              Read the wheat story
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page border-t border-line py-12">
      <div className="grid items-center gap-8 sm:grid-cols-[160px_minmax(0,1fr)]">
        {image}
        <div>
          {crop.status ? <HarvestStatus status={crop.status} /> : null}
          <h2 className="type-h2 mt-2">{crop.name}</h2>
          <p className="mt-4 max-w-[38ch] text-ink-muted">{crop.summary}</p>
          <p className="mt-4">
            <Link href={`/grow/${crop.slug}`} className="text-link">
              Read the crop’s story
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const crops = fileContent.listCrops();
  const intro = fileContent.chapterById("home-intro");
  const natural = fileContent.chapterById("home-natural");
  const hero = mediaById("panicle");
  const wheatDrawing = mediaById("wheat");

  return (
    <>
      <div className="hero-grid container-page pt-8 pb-4 lg:min-h-[calc(100svh-72px)] lg:pt-12 lg:pb-8">
        <div className="hero-copy max-w-[40rem]">
          <p className="type-eyebrow text-green">Ram Ganga Agro</p>
          <h1 className="type-display mt-4 lg:max-w-[11ch]">
            Good food begins long before the table.
          </h1>
          <p className="type-deck mt-5 max-w-[32ch] text-ink-muted">
            A farm, its crops, and the journey from the land to the table.
          </p>
        </div>
        {hero ? <HeroPlate primary={hero} /> : null}
        <div className="hero-actions">
          <div className="flex flex-wrap gap-3">
            <Button href="/our-farm">Explore our farm</Button>
            <Button href="/grow" variant="quiet">
              What we grow
            </Button>
          </div>
          {wheatDrawing ? (
            <figure className="mt-8 mb-0 hidden items-end gap-3 lg:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={wheatDrawing.src} alt={wheatDrawing.alt} className="h-24 w-auto" />
              <figcaption className="type-caption pb-1">Wheat</figcaption>
            </figure>
          ) : null}
        </div>
      </div>

      <section className="container-page section">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {intro ? (
            <div>
              <p className="type-eyebrow mb-5 text-green">{intro.eyebrow}</p>
              <h2 className="type-h2 max-w-[16ch]">{intro.title}</h2>
              {intro.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-6 max-w-[38ch] text-ink-muted">
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
            </div>
          ) : null}
          {natural ? (
            <div className="border-t border-green pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
              <p className="type-eyebrow mb-5 text-green">{natural.eyebrow}</p>
              <h2 className="type-h2">{natural.title}</h2>
              {natural.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-6 max-w-[36ch] text-ink-muted">
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
          ) : null}
        </div>
      </section>

      <section className="container-page pt-2 pb-8 lg:pb-4">
        <p className="type-eyebrow text-green">Our harvest</p>
        <h2 className="type-h2 mt-4 max-w-[16ch]">What we grow.</h2>
        <p className="mt-5 max-w-[36ch] text-ink-muted">
          Raktshali and wheat each have a page. Another crop joins them when the
          farm confirms its name.
        </p>
      </section>

      {crops.map((crop) => (
        <CropSpread key={crop.slug} crop={crop} />
      ))}

      <section className="container-page section">
        <p className="type-eyebrow mb-5 text-green">From the land to the table</p>
        <h2 className="type-h2 max-w-[18ch]">The path the story follows.</h2>
        <p className="mt-5 max-w-[36ch] text-ink-muted">
          Each part is written when the farm has something to say.
        </p>
        <div className="mt-8">
          <FarmJourney steps={landToTable} />
        </div>
      </section>

      <section className="border-t border-line">
        <div className="container-page section grid items-start gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="type-eyebrow mb-5 text-green">From the farm</p>
            <JournalEmpty />
            <p className="mt-6">
              <Link href="/journal" className="text-link">
                Read the farm journal
              </Link>
            </p>
          </div>
          <div id="follow">
            <p className="type-eyebrow mb-5 text-green">Harvest notes</p>
            <h2 className="type-h2">Follow the journey.</h2>
            <p className="mt-5 max-w-[36ch] text-ink-muted">
              A note when the farm has something to say about the season. The
              address is kept. Nothing is emailed yet. You can remove it
              whenever you want.
            </p>
            <div className="mt-8">
              <NewsletterForm source="homepage" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
