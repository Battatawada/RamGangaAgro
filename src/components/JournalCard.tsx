import Link from "next/link";
import type { JournalKind } from "@/content/journal";

type Props = {
  title: string;
  href: string;
  date: string;
  kind: JournalKind;
  excerpt: string;
  media: { src: string; alt: string } | null;
};

/**
 * Used only when a real post exists. There is no "coming soon" variant: the
 * empty state is a separate block.
 */
export function JournalCard({ title, href, date, kind, excerpt, media }: Props) {
  return (
    <Link href={href} className="card-link block no-underline">
      <article className="surface overflow-hidden md:flex md:items-stretch">
        {media ? (
          <div className="aspect-3/2 bg-raktshali-soft md:w-[240px] md:shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.src}
              alt={media.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="p-6">
          <p className="type-eyebrow text-green">
            {kind === "film" ? "Film" : "Note"}
          </p>
          <h3 className="type-h3 mt-2">{title}</h3>
          <p className="type-caption mt-2">
            <time dateTime={date}>{date}</time>
          </p>
          <p className="prose-measure mt-3 text-ink-muted">{excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
