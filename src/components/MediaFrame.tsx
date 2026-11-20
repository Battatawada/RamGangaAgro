import type { MediaAsset } from "@/content/media";
import { IllustrationImage } from "@/components/IllustrationImage";

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

  return (
    <figure className={`m-0 ${className}`.trim()}>
      <div
        className={`relative overflow-hidden bg-paper-raised ${aspectClass[aspect]}`}
      >
        <IllustrationImage
          asset={asset}
          fill
          className={
            photo
              ? "object-cover"
              : "m-auto h-[78%] w-[78%] max-h-[78%] max-w-[78%] object-contain"
          }
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {asset.caption ? (
        <figcaption className="type-caption mt-3">{asset.caption}</figcaption>
      ) : null}
    </figure>
  );
}