import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JournalEntry } from "@/components/story/StorySections";
import { fileContent } from "@/content/source";

type Params = { params: Promise<{ slug: string }> };

// Rendered on the request, like every other page under the strict CSP. A slug
// with no post calls notFound() below.

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = fileContent.getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function JournalEntryPage({ params }: Params) {
  const { slug } = await params;
  const post = fileContent.getPost(slug);
  if (!post) notFound();

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Journal", href: "/journal" }, { label: post.title }]}
      />
      <JournalEntry
        title={post.title}
        date={post.date}
        byline={post.byline}
        paragraphs={post.body}
      />
    </>
  );
}
