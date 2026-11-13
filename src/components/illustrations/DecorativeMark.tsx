import { mediaById } from "@/content/media";

/**
 * A drawing used as ornament. It is hidden from assistive technology.
 * It is not a photograph and it must not carry a factual caption.
 */
export function DecorativeMark({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const asset = mediaById(id);
  if (!asset || !asset.decorative) return null;

  return (
    // The file is an original drawing. The img alt is empty because the
    // asset is marked decorative; aria-hidden keeps the SVG title quiet.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none object-contain ${className}`.trim()}
    />
  );
}
