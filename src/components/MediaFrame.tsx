import type { MediaAsset } from "@/content/media";

const aspectClass = {
  wide: "aspect-[2/1]",
  landscape: "aspect-[3/2]",
  detail: "aspect-square",
  portrait: "aspect-[4/5]",
} as const;

export type FrameAspect = keyof typeof aspectClass;

type Props = {
  asset: MediaAsset;
  aspect?: FrameAspect;
  className?: string;
};

/**
 * A fixed frame for a photograph or a drawing. The box keeps its ratio when
 * the file inside it changes, so a later photograph does not shift the page.
 */
export function MediaFrame({ asset, aspect = "landscape", className = "" }: Props) {
  const photo = asset.kind === "image";
  const decorative = asset.decorative === true || asset.alt === "";

  return (
    <figure className={`m-0 ${className}`.trim()}>
      <div
        className={`relative overflow-hidden bg-paper-raised ${aspectClass[aspect]}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.src}
          alt={decorative ? "" : asset.alt}
          aria-hidden={decorative ? true : undefined}
          className={
            photo
              ? "absolute inset-0 h-full w-full object-cover"
              : "absolute inset-0 m-auto h-[78%] w-[78%] object-contain"
          }
        />
      </div>
      {asset.caption ? (
        <figcaption className="type-caption mt-3">{asset.caption}</figcaption>
      ) : null}
    </figure>
  );
}
