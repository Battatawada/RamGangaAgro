import Link from "next/link";
import { HarvestStatus } from "@/components/HarvestStatus";
import { cropPanelClass, type CropStatus, type CropTone } from "@/content/crops";
import { flags } from "@/server/flags";

type Props = {
  name: string;
  summary: string;
  href: string;
  status: CropStatus | null;
  tone?: CropTone;
  media: { src: string; alt: string };
  pricePaise: number | null;
  purchasable: boolean;
  /** "editorial" is an open column. "stacked" and "row" are the crop index. */
  layout?: "stacked" | "row" | "editorial";
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
  tone = "raktshali",
}: Props) {
  const showPrice =
    flags.STOREFRONT_ENABLED && pricePaise != null && purchasable;
  const panel = cropPanelClass[tone];

  if (layout === "editorial") {
    return (
      <article className="border-t border-line pt-8">
        <Link href={href} className="grid items-end gap-6 no-underline sm:grid-cols-[148px_1fr]">
          <div className={`grid min-h-[200px] place-items-center px-4 ${panel}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.src} alt={media.alt} className="h-auto w-[min(78%,120px)]" />
          </div>
          <div>
            {status ? <HarvestStatus status={status} /> : null}
            {titleAs === "p" ? (
              <p className="type-h3 mt-2">{name}</p>
            ) : (
              <h3 className="type-h3 mt-2">{name}</h3>
            )}
            <p className="mt-3 text-ink-muted">{summary}</p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <Link href={href} className="card-link block no-underline">
      <article
        className={`surface overflow-hidden ${
          layout === "row" ? "md:flex md:items-stretch" : ""
        }`}
      >
        <div
          className={`relative grid aspect-4/5 place-items-center p-5 ${panel} ${
            layout === "row" ? "md:w-[280px] md:shrink-0" : ""
          }`}
        >
          {status ? <HarvestStatus status={status} className="absolute top-4 left-4" /> : null}
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
