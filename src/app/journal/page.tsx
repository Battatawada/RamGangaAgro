import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JournalCard } from "@/components/JournalCard";
import { JournalEmpty } from "@/components/JournalEmpty";
import { journalPosts } from "@/content/journal";
import { pageMeta } from "@/content/meta";

export const metadata: Metadata = pageMeta({
  title: "The journal",
  description: "Notes from the farm, when there is a season to record.",
  path: "/journal",
});

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
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/#follow" className="text-link">
                  Follow the farm
                </Link>
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
