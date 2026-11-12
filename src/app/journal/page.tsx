import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JournalCard } from "@/components/JournalCard";
import { JournalEmpty } from "@/components/JournalEmpty";
import { journalPosts } from "@/content/journal";

export const metadata: Metadata = {
  title: "The journal",
  description: "Notes from the farm, when there is a season to record.",
};

export default function JournalPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Journal" }]} />
      <div className="container-page section">
        <h1 className="type-h1">The journal.</h1>
        <p className="type-deck prose-measure mt-6 text-ink-muted">
          Notes from the farm, when there is a season to record.
        </p>

        <div className="mt-12">
          {journalPosts.length === 0 ? (
            <JournalEmpty>
              <p className="mt-6">
                <Link href="/" className="text-link">
                  Back to the farm
                </Link>
              </p>
            </JournalEmpty>
          ) : (
            <ul className="grid list-none gap-8 p-0">
              {journalPosts.map((post) => (
                <li key={post.slug}>
                  <JournalCard
                    title={post.title}
                    href={`/journal/${post.slug}`}
                    date={post.date}
                    kind={post.kind}
                    excerpt={post.excerpt}
                    media={null}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
