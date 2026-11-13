/**
 * Editorial containers. A chapter is a place for the farm’s words. Status
 * says whether those words may be read as fact.
 *
 * `approved` — the project owner has allowed the sentence on the public site.
 * `draft` — a holding sentence from the page specifications, still waiting
 * for the farm.
 * `placeholder` — an honest gap. It is not a fact about the land.
 */

export type CopyStatus = "approved" | "draft" | "placeholder";

export type StoryKind =
  | "opening"
  | "from-the-land"
  | "growing-now"
  | "crop-chapter"
  | "seasonal-note"
  | "field-observation"
  | "journey-ahead"
  | "journal-entry"
  | "what-comes-next";

export type StoryChapter = {
  id: string;
  page: string;
  kind: StoryKind;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  status: CopyStatus;
  mediaId?: string;
  href?: string;
  linkLabel?: string;
};

export const storyChapters: StoryChapter[] = [
  {
    id: "home-opening",
    page: "home",
    kind: "opening",
    eyebrow: "Ram Ganga Agro",
    title: "Good food begins long before the table.",
    paragraphs: ["A farm, its crops, and the journey from the land to the table."],
    status: "draft",
  },
  {
    id: "home-season",
    page: "home",
    kind: "seasonal-note",
    eyebrow: "This season",
    title: "The story is still being written.",
    paragraphs: ["More from the field soon."],
    status: "placeholder",
    mediaId: "grain",
  },
  {
    id: "farm-story",
    page: "story",
    kind: "opening",
    title: "Our story",
    paragraphs: [
      "The story of Ram Ganga Agro will be published in the farm’s own words.",
    ],
    status: "draft",
    href: "/grow",
    linkLabel: "What we grow",
  },
  {
    id: "farm-story-gap",
    page: "story",
    kind: "what-comes-next",
    title: "The story is still being written.",
    paragraphs: ["More from the field soon."],
    status: "placeholder",
    href: "/our-farm",
    linkLabel: "Back to Our farm",
  },
  {
    id: "farm-land",
    page: "land",
    kind: "from-the-land",
    title: "The land",
    paragraphs: [
      "The land will be described when the farm is ready to say where it is.",
    ],
    status: "draft",
    mediaId: "contours",
  },
  {
    id: "farm-land-note",
    page: "land",
    kind: "field-observation",
    title: "More from the field soon.",
    paragraphs: ["The story is still being written."],
    status: "placeholder",
  },
  {
    id: "farm-practices",
    page: "practices",
    kind: "opening",
    title: "Practices",
    paragraphs: [
      "Farming practices will be described here only when the farm has confirmed them.",
    ],
    status: "draft",
  },
  {
    id: "farm-practices-gap",
    page: "practices",
    kind: "seasonal-note",
    title: "The story is still being written.",
    paragraphs: ["More from the field soon."],
    status: "placeholder",
  },
  {
    id: "grow-now",
    page: "grow",
    kind: "growing-now",
    title: "What we grow.",
    paragraphs: ["The harvest, as it is. One crop is growing. It is not yet for sale."],
    status: "draft",
  },
];

export function chaptersFor(page: string): StoryChapter[] {
  return storyChapters.filter((chapter) => chapter.page === page);
}

export function chapterById(id: string): StoryChapter | undefined {
  return storyChapters.find((chapter) => chapter.id === id);
}
