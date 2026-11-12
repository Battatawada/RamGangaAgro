import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  as?: "h1" | "h2";
  lede?: ReactNode;
  tone?: "paper" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  as = "h2",
  lede,
  tone = "paper",
  className = "",
}: Props) {
  const Title = as;
  const eyebrowColour =
    tone === "dark" ? "text-paper" : as === "h1" ? "text-green" : "text-green";

  return (
    <div className={className}>
      {eyebrow ? (
        <p className={`type-eyebrow mb-5 ${eyebrowColour}`}>{eyebrow}</p>
      ) : null}
      <Title className={as === "h1" ? "type-h1" : "type-h2"}>{title}</Title>
      {lede ? (
        <p
          className={`type-deck prose-measure mt-6 ${
            tone === "dark" ? "text-paper" : "text-ink-muted"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
