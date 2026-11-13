import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/content/meta";

export const metadata: Metadata = pageMeta({
  title: "Terms",
  description: "The terms for using the Ram Ganga Agro website.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Terms" }]} />
      <div className="container-page section">
        <h1 className="type-h1">Terms.</h1>

        <div className="prose-page mt-8">
          <p className="type-caption">
            Draft. It needs review by the farm, and a professional legal
            review, before the public domain serves it. It is not a claim that
            such a review has happened.
          </p>

          <h2 className="type-h2 mt-10">What this site is</h2>
          <p className="mt-4 text-ink-muted">
            This site is information published by Ram Ganga Agro about its farm
            and its crops. Nothing on it is offered for sale, and no order can
            be placed here.
          </p>

          <h2 className="type-h2 mt-10">The content</h2>
          <p className="mt-4 text-ink-muted">
            Please ask the farm before republishing the words or the drawings
            on this site. The drawings are illustrations. They are not
            photographs of the farm.
          </p>

          <h2 className="type-h2 mt-10">Writing to the farm</h2>
          <p className="mt-4 text-ink-muted">
            A note sent through the contact form is handled as described on the{" "}
            <Link href="/privacy" className="text-link">
              privacy page
            </Link>
            . Please do not send anything confidential through it.
          </p>

          <h2 className="type-h2 mt-10">Changes</h2>
          <p className="mt-4 text-ink-muted">
            If these terms change, the new version replaces this one here.
          </p>
        </div>
      </div>
    </>
  );
}
