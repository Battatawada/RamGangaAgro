import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JournalEntry } from "@/components/story/StorySections";
import { pageMeta } from "@/content/meta";
import { articleStructuredData, jsonLd } from "@/content/structured-data";
import { fileContent } from "@/content/source";
import { requestNonce } from "@/server/request-nonce";

type Params = { params: Promise<{ slug: string }> };

// Rendered on the request, like every other page under the strict CSP. A slug
// with no post calls notFound() below.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = fileContent.getPost(slug);
  if (!post) {
    return { title: "Page not found", robots: { index: false, follow: true } };
  }
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path: `/journal/${post.slug}`,
    type: "article",
  });
}

export default async function JournalEntryPage({ params }: Params) {
  const { slug } = await params;
  const post = fileContent.getPost(slug);
  if (!post) notFound();

  const nonce = requestNonce(await headers());
  const relatedCrops = post.cropSlugs
    .map((slug) => fileContent.getCrop(slug))
    .filter((crop) => crop !== undefined);

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Journal", href: "/journal" }, { label: post.title }]}
        path={`/journal/${post.slug}`}
      />
      {nonce ? (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: jsonLd(
              articleStructuredData({
                title: post.title,
                excerpt: post.excerpt,
                date: post.date,
                path: `/journal/${post.slug}`,
              }),
            ),
          }}
        />
      ) : null}
      <JournalEntry
        title={post.title}
        date={post.date}
        byline={post.byline}
        paragraphs={post.body}
      />
      <div className="container-page pb-16">
        <p className="flex flex-wrap gap-x-6 gap-y-2">
          {relatedCrops.map((crop) => (
            <Link key={crop.slug} href={`/grow/${crop.slug}`} className="text-link">
              {crop.name}
            </Link>
          ))}
          <Link href="/grow" className="text-link">
            What we grow
          </Link>
          <Link href="/our-farm/practices" className="text-link">
            Natural farming
          </Link>
          <Link href="/journal" className="text-link">
            The journal
          </Link>
        </p>
      </div>
    </>
  );
}
