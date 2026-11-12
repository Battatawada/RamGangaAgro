import Link from "next/link";

type Props = {
  title: string;
  paragraphs: string[];
  link?: { href: string; label: string };
  as?: "h2" | "h3";
};

/** Prose only. It does not accept raw HTML. */
export function FarmStory({ title, paragraphs, link, as = "h2" }: Props) {
  const Title = as;
  return (
    <section className="prose-page">
      <Title className={as === "h2" ? "type-h2" : "type-h3"}>{title}</Title>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-ink-muted">
          {paragraph}
        </p>
      ))}
      {link ? (
        <p className="mt-6">
          <Link href={link.href} className="text-link">
            {link.label}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
