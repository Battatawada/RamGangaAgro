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
    <Link href={href} className="group block no-underline">
      <article className="grid gap-6 border-t border-line pt-8 md:grid-cols-[240px_minmax(0,1fr)] md:items-end">
        {media ? (
          <div className="relative aspect-[3/2] overflow-hidden bg-paper-raised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media.src}
              alt={media.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div>
          <p className="type-eyebrow text-green">
            {kind === "film" ? "Film" : "Note"}
          </p>
          <h3 className="type-h3 mt-2 transition-colors duration-150 group-hover:text-raktshali">
            {title}
          </h3>
          <p className="type-caption mt-2">
            <time dateTime={date}>{date}</time>
          </p>
          <p className="prose-measure mt-3 text-ink-muted">{excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
