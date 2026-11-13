import type { MediaAsset } from "@/content/media";

type Props = {
  primary: MediaAsset;
};

/**
 * The principal drawing, or a photograph when one exists.
 * It sits on the page. It is not placed inside an empty panel.
 */
export function HeroPlate({ primary }: Props) {
  const photo = primary.kind === "image";

  return (
    <figure className="hero-plate">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={primary.src} alt={primary.alt} className="hero-photo" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={primary.src}
          alt={primary.alt}
          className="hero-drawing"
        />
      )}
      {primary.caption ? (
        <figcaption className="type-caption mt-3 lg:text-right">{primary.caption}</figcaption>
      ) : null}
    </figure>
  );
}
