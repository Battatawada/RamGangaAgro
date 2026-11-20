/** Literal placeholder tokens that must not remain on indexable pages. */
export const PLACEHOLDER_PATTERN = /\{\{[A-Z0-9_]+\}\}/g;

export function containsPlaceholder(text: string): boolean {
  PLACEHOLDER_PATTERN.lastIndex = 0;
  return PLACEHOLDER_PATTERN.test(text);
}

/** Hide unreplaced content slots on public pages until copy is supplied. */
export function publishableParagraphs(paragraphs: string[] | null | undefined): string[] {
  if (!paragraphs) return [];
  return paragraphs.filter((paragraph) => !containsPlaceholder(paragraph));
}