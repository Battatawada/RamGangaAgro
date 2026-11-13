import type { ReactNode } from "react";
import Link from "next/link";
import { DecorativeMark } from "@/components/illustrations/DecorativeMark";
import type { StoryKind } from "@/content/story";

export type StoryProps = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  titleAs?: "h1" | "h2" | "h3";
  href?: string;
  linkLabel?: string;
  mediaId?: string;
};

const gapLine = {
  written: "The story is still being written.",
  field: "More from the field soon.",
} as const;

function Title({
  as = "h2",
  children,
}: {
  as?: "h1" | "h2" | "h3";
  children: string;
}) {
  const className = as === "h1" ? "type-h1" : as === "h3" ? "type-h3" : "type-h2";
  if (as === "h1") return <h1 className={className}>{children}</h1>;
  if (as === "h3") return <h3 className={className}>{children}</h3>;
  return <h2 className={className}>{children}</h2>;
}

function Lines({
  paragraphs,
  gap = "written",
}: {
  paragraphs: string[];
  gap?: keyof typeof gapLine;
}) {
  const body = paragraphs.length > 0 ? paragraphs : [gapLine[gap]];
  return (
    <>
      {body.map((paragraph) => (
        <p key={paragraph} className="mt-4 text-ink-muted">
          {paragraph}
        </p>
      ))}
    </>
  );
}

function More({ href, linkLabel }: { href?: string; linkLabel?: string }) {
  if (!href || !linkLabel) return null;
  return (
    <p className="mt-6">
      <Link href={href} className="text-link">
        {linkLabel}
      </Link>
    </p>
  );
}

function Frame({
  kind,
  children,
  className = "",
}: {
  kind: StoryKind;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section data-story={kind} className={className}>
      {children}
    </section>
  );
}

/** The first sentence of a page. It does not invent the farm’s history. */
export function OpeningThought(props: StoryProps) {
  return (
    <Frame kind="opening" className="prose-page">
      {props.eyebrow ? <p className="type-eyebrow mb-5 text-green">{props.eyebrow}</p> : null}
      <Title as={props.titleAs ?? "h1"}>{props.title}</Title>
      <Lines paragraphs={props.paragraphs} />
      <More href={props.href} linkLabel={props.linkLabel} />
    </Frame>
  );
}

/** A place for the land, once the farm is willing to name it. */
export function FromTheLand(props: StoryProps) {
  return (
    <Frame kind="from-the-land" className="prose-page">
      <Title as={props.titleAs ?? "h1"}>{props.title}</Title>
      <Lines paragraphs={props.paragraphs} gap="field" />
      {props.mediaId ? (
        <DecorativeMark id={props.mediaId} className="mt-10 h-24 w-full" />
      ) : null}
      <More href={props.href} linkLabel={props.linkLabel} />
    </Frame>
  );
}

/** What is actually growing. Status and sale words stay on the crop record. */
export function GrowingNow(props: StoryProps) {
  return (
    <Frame kind="growing-now">
      <Title as={props.titleAs ?? "h1"}>{props.title}</Title>
      <div className="type-deck prose-measure">
        <Lines paragraphs={props.paragraphs} />
      </div>
    </Frame>
  );
}

/** One section of a crop essay. An empty slot stays an empty slot. */
export function CropChapter({
  id,
  title,
  paragraphs,
  empty,
}: {
  id?: string;
  title: string;
  paragraphs: string[] | null;
  empty?: string;
}) {
  if (!paragraphs && !empty) return null;
  return (
    <Frame kind="crop-chapter" className="mb-16 scroll-mt-24">
      <div id={id}>
        <Title as="h2">{title}</Title>
        {paragraphs ? <Lines paragraphs={paragraphs} /> : <Lines paragraphs={empty ? [empty] : []} gap="field" />}
      </div>
    </Frame>
  );
}

/** A short note that a season has not been written yet, or has. */
export function SeasonalNote(props: StoryProps) {
  return (
    <Frame kind="seasonal-note" className="surface prose-measure p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          {props.eyebrow ? <p className="type-eyebrow mb-5 text-green">{props.eyebrow}</p> : null}
          <Title as={props.titleAs ?? "h2"}>{props.title}</Title>
        </div>
        <DecorativeMark id={props.mediaId ?? "grain"} className="h-10 w-16 shrink-0" />
      </div>
      <Lines paragraphs={props.paragraphs} gap="field" />
    </Frame>
  );
}

/** A quiet aside. It is not a measurement and not a photograph. */
export function FieldObservation(props: StoryProps) {
  return (
    <Frame kind="field-observation" className="mt-10 border-t border-line pt-8">
      <p className="type-eyebrow text-clay-deep">From the field</p>
      <Title as="h2">{props.title}</Title>
      <Lines paragraphs={props.paragraphs} gap="written" />
    </Frame>
  );
}

/** The next page in the journey, not a promise of what will be grown. */
export function JourneyAhead({
  title,
  steps,
}: {
  title: string;
  steps: { href: string; label: string; text: string }[];
}) {
  return (
    <Frame kind="journey-ahead">
      <Title as="h2">{title}</Title>
      <ul className="mt-6 grid list-none gap-4 p-0">
        {steps.map((step) => (
          <li key={step.href} className="border-t border-line pt-4">
            <h3 className="type-h3">
              <Link href={step.href} className="text-link no-underline hover:text-raktshali">
                {step.label}
              </Link>
            </h3>
            <p className="mt-2 text-ink-muted">{step.text}</p>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** A published note. Paragraphs are text, never markup. */
export function JournalEntry({
  title,
  date,
  byline,
  paragraphs,
}: {
  title: string;
  date: string;
  byline: string;
  paragraphs: string[];
}) {
  return (
    <article data-story="journal-entry" className="container-page section">
      <h1 className="type-h1">{title}</h1>
      <p className="type-caption mt-4">
        <time dateTime={date}>{date}</time>
        {" · "}
        {byline}
      </p>
      <div className="prose-page mt-8">
        <Lines paragraphs={paragraphs} />
      </div>
    </article>
  );
}

/** Where a reader can go next. It does not announce an unbuilt feature. */
export function WhatComesNext(props: StoryProps) {
  return (
    <Frame kind="what-comes-next" className="prose-page mt-10 border-t border-line pt-8">
      <Title as="h2">{props.title}</Title>
      <Lines paragraphs={props.paragraphs} gap="field" />
      <More href={props.href} linkLabel={props.linkLabel} />
    </Frame>
  );
}
