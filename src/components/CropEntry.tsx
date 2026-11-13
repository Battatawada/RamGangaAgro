import Link from "next/link";
import { HarvestStatus } from "@/components/HarvestStatus";
import { cropPanelClass, type CropStatus, type CropTone } from "@/content/crops";
import { flags } from "@/server/flags";

const ruleClass: Record<CropTone, string> = {
  raktshali: "bg-raktshali",
  wheat: "bg-grain",
  farm: "bg-green",
};

type Props = {
  name: string;
  summary: string;
  href: string;
  status: CropStatus | null;
  tone?: CropTone;
  media: { src: string; alt: string };
  pricePaise: number | null;
  purchasable: boolean;
  titleAs?: "h2" | "h3";
};

/** A crop, linked to its page. It is not a product tile. */
export function CropEntry({
  name,
  summary,
  href,
  status,
  media,
  pricePaise,
  purchasable,
  titleAs = "h3",
  tone = "farm",
}: Props) {
  const showPrice = flags.STOREFRONT_ENABLED && pricePaise != null && purchasable;
  const Title = titleAs;

  return (
    <article className="border-t border-line pt-8">
      <Link
        href={href}
        className="group grid items-end gap-8 no-underline sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-12"
      >
        <div className={`grid place-items-center px-6 py-8 ${cropPanelClass[tone]}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt={media.alt}
            className="h-auto w-[180px]"
          />
        </div>
        <div>
          <span className={`mb-5 block h-px w-10 ${ruleClass[tone]}`} aria-hidden="true" />
          {status ? <HarvestStatus status={status} /> : null}
          <Title className="type-h3 mt-2 transition-colors duration-150 group-hover:text-raktshali">
            {name}
          </Title>
          <p className="mt-3 max-w-[36ch] text-ink-muted">{summary}</p>
          {showPrice ? (
            <p className="mt-3">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(pricePaise / 100)}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
