import type { MediaAsset } from "@/content/media";
import { IllustrationImage } from "@/components/IllustrationImage";

type Props = {
  primary: MediaAsset;
  /** Marks the LCP image: high fetch priority, eager loading, no lazy hint. */
  priority?: boolean;
};

/**
 * The principal drawing, or a photograph when one exists.
 * It sits on the page. It is not placed inside an empty panel.
 */
export function HeroPlate({ primary, priority = false }: Props) {
  const photo = primary.kind === "image";

  return (
    <figure className="hero-plate">
      <IllustrationImage
        asset={primary}
        className={photo ? "hero-photo" : "hero-drawing"}
        priority={priority}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        sizes="(max-width: 1024px) 90vw, 420px"
      />
      {primary.caption ? (
        <figcaption className="type-caption mt-3 lg:text-right">{primary.caption}</figcaption>
      ) : null}
    </figure>
  );
}