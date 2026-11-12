import Link from "next/link";

export type JourneyStep = {
  n: string;
  title: string;
  text: string;
  href: string;
};

export function FarmJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="grid list-none gap-6 p-0 lg:grid-cols-5">
      {steps.map((step) => (
        <li key={step.n} className="border-t border-green pt-4">
          <p className="font-display text-[13px] tracking-[0.08em] text-raktshali">
            {step.n}
          </p>
          <h3 className="type-h3 mt-2">
            <Link href={step.href} className="no-underline hover:text-raktshali">
              {step.title}
            </Link>
          </h3>
          <p className="mt-2 text-ink-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
