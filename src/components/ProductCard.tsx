import Link from "next/link";
import { HarvestStatus } from "@/components/HarvestStatus";
import type { CropStatus } from "@/content/crops";
import { flags } from "@/server/flags";

type Props = {
  name: string;
  summary: string;
  href: string;
  status: CropStatus;
  media: { src: string; alt: string };
  pricePaise: number | null;
  purchasable: boolean;
  /** "stacked" is the homepage card. "row" is the crop index from 768px. */
  layout?: "stacked" | "row";
  /**
   * Heading level for the crop name. The homepage section heading is the
   * column beside the card, so the card name stays a paragraph there.
   */
  titleAs?: "h2" | "h3" | "p";
};

export function ProductCard({
  name,
  summary,
  href,
  status,
  media,
  pricePaise,
  purchasable,
  layout = "stacked",
  titleAs = "h3",
}: Props) {
  const showPrice =
    flags.STOREFRONT_ENABLED && pricePaise != null && purchasable;

  return (
    <Link href={href} className="card-link block no-underline">
      <article
        className={`surface overflow-hidden ${
          layout === "row" ? "md:flex md:items-stretch" : ""
        }`}
      >
        <div
          className={`relative grid aspect-4/5 place-items-center bg-raktshali-soft p-5 ${
            layout === "row" ? "md:w-[280px] md:shrink-0" : ""
          }`}
        >
          <HarvestStatus status={status} className="absolute top-4 left-4" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt={media.alt}
            className="h-auto w-[min(46%,180px)]"
          />
        </div>
        <div className="p-6">
          {titleAs === "p" ? (
            <p className="type-h3">{name}</p>
          ) : titleAs === "h2" ? (
            <h2 className="type-h3">{name}</h2>
          ) : (
            <h3 className="type-h3">{name}</h3>
          )}
          <p className="prose-measure mt-3 text-ink-muted">{summary}</p>
          {showPrice ? (
            <p className="mt-3">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(pricePaise / 100)}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
