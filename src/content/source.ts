import { crops, getCrop, otherCrops, type Crop } from "@/content/crops";
import { getPost, journalPosts, postsForCrop, type JournalPost } from "@/content/journal";
import { chapterById, chaptersFor, landToTable, type StoryChapter } from "@/content/story";

export { landToTable };

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
  otherCrops(slug: string): Crop[];
  listPosts(): JournalPost[];
  getPost(slug: string): JournalPost | undefined;
  postsForCrop(slug: string): JournalPost[];
  chaptersFor(page: string): StoryChapter[];
  chapterById(id: string): StoryChapter | undefined;
};

export const fileContent: ContentSource = {
  listCrops: () => crops,
  getCrop,
  otherCrops,
  listPosts: () => journalPosts,
  getPost,
  postsForCrop,
  chaptersFor,
  chapterById,
};
