/**
 * Per-page Google indexing. Flip a path to `true` when real content replaces
 * placeholders. The sitemap and page metadata both read this map.
 */
export const pageSearchIndex = {
  "/": true,
  "/our-farm": false,
  "/our-farm/story": false,
  "/our-farm/the-land": false,
  "/our-farm/practices": false,
  "/grow": true,
  "/grow/raktshali-rice": true,
  "/grow/wheat": true,
  "/journal": false,
  "/contact": true,
  "/follow": false,
  "/privacy": true,
  "/terms": true,
  "/wholesale": false,
  "/hi": false,
  "/hi/contact": false,
  "/hi/grow/raktshali-rice": false,
  "/hi/grow/wheat": false,
} as const satisfies Record<string, boolean>;

export type SearchIndexPath = keyof typeof pageSearchIndex;

export function isPageSearchIndexable(path: string): boolean {
  return path in pageSearchIndex && pageSearchIndex[path as SearchIndexPath] === true;
}