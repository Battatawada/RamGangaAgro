import Link from "next/link";

export type JourneyStep = {
  n: string;
  title: string;
  text: string;
  href: string;
};

export function FarmJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="journey">
      {steps.map((step) => (
        <li key={step.n}>
          <p className="font-display text-[13px] tracking-[0.08em] text-raktshali">
            {step.n}
          </p>
          <h3 className="type-h3">
            <Link
              href={step.href}
              className="inline-flex min-h-11 items-center no-underline hover:text-raktshali"
            >
              {step.title}
            </Link>
          </h3>
          <p className="col-span-2 text-ink-muted lg:col-span-1">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
