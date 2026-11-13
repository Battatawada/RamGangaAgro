/**
 * The journal is empty in Phase 1. Sample posts are forbidden by docs/15.
 *
 * `body` is an array of paragraphs rather than a string of markup, so no post
 * can ever introduce raw HTML into the page.
 */
export type JournalKind = "note" | "film";

export type JournalPost = {
  slug: string;
  title: string;
  date: string;
  kind: JournalKind;
  excerpt: string;
  body: string[];
  byline: string;
  /** A media registry id. Null until the farm has a picture for the note. */
  mediaId: string | null;
};

export const journalPosts: JournalPost[] = [];

export function getPost(slug: string): JournalPost | undefined {
  return journalPosts.find((post) => post.slug === slug);
}
