import { crops, getCrop, type Crop } from "@/content/crops";
import { getPost, journalPosts, type JournalPost } from "@/content/journal";
import { chapterById, chaptersFor, type StoryChapter } from "@/content/story";

/**
 * The read API for public content. Pages depend on this shape, not on a file
 * path and not on a CMS client.
 *
 * Today `fileContent` reads the TypeScript modules in this folder. A later
 * database or CMS adapter can implement the same functions. The swap belongs
 * in this module. Components should not import a vendor SDK.
 */
export type ContentSource = {
  listCrops(): Crop[];
  getCrop(slug: string): Crop | undefined;
  listPosts(): JournalPost[];
  getPost(slug: string): JournalPost | undefined;
  chaptersFor(page: string): StoryChapter[];
  chapterById(id: string): StoryChapter | undefined;
};

export const fileContent: ContentSource = {
  listCrops: () => crops,
  getCrop,
  listPosts: () => journalPosts,
  getPost,
  chaptersFor,
  chapterById,
};
