import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getPost } from "@/content/journal";

type Params = { params: Promise<{ slug: string }> };

// Rendered on the request, like every other page under the strict CSP. A slug
// with no post calls notFound() below.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function JournalEntryPage({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Journal", href: "/journal" }, { label: post.title }]}
      />
      <article className="container-page section">
        <h1 className="type-h1">{post.title}</h1>
        <p className="type-caption mt-4">
          <time dateTime={post.date}>{post.date}</time> · {post.byline}
        </p>
        <div className="prose-page mt-8">
          {post.body.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </>
  );
}
