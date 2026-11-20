import Image from "next/image";
import type { MediaAsset } from "@/content/media";

type Props = {
  asset: MediaAsset;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  /** Fill the nearest positioned ancestor (MediaFrame). */
  fill?: boolean;
};

/**
 * Local SVG and future photographs under /public. SVG stays unoptimized so
 * layout dimensions from the content catalog stay stable.
 */
export function IllustrationImage({
  asset,
  className,
  priority,
  sizes,
  loading,
  fetchPriority,
  fill,
}: Props) {
  const decorative = asset.decorative === true;

  return (
    <Image
      src={asset.src}
      alt={decorative ? "" : asset.alt}
      width={fill ? undefined : asset.width}
      height={fill ? undefined : asset.height}
      fill={fill}
      unoptimized={asset.src.endsWith(".svg")}
      className={className}
      priority={priority}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      aria-hidden={decorative ? true : undefined}
    />
  );
}