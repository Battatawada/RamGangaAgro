type Props = {
  kind: "illustration" | "image" | "video";
  src: string;
  alt: string;
  poster?: string;
  caption?: string;
  /** Tailwind classes for the box. The parent decides the size. */
  className?: string;
  mediaClassName?: string;
};

/**
 * The hero media slot. It holds a drawing today and a photograph or a film
 * later without the page around it changing.
 */
export function MediaHero({
  kind,
  src,
  alt,
  poster,
  caption,
  className = "",
  mediaClassName = "",
}: Props) {
  return (
    <figure className={`m-0 ${className}`.trim()}>
      <div className="grid h-full place-items-center p-6">
        {kind === "video" ? (
          <video
            className={`h-full w-full rounded-[2px] object-cover ${mediaClassName}`.trim()}
            poster={poster}
            muted
            playsInline
            controls
            preload="none"
            aria-label={alt}
          >
            <source src={src} />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className={
              kind === "image"
                ? `h-full w-full rounded-[2px] object-cover ${mediaClassName}`.trim()
                : `h-auto w-full ${mediaClassName}`.trim()
            }
          />
        )}
      </div>
      {caption ? (
        <figcaption className="type-caption mt-3 text-center">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
