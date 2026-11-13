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
    id: "home-intro",
    page: "home",
    kind: "opening",
    eyebrow: "The farm",
    title: "Every grain has a beginning.",
    paragraphs: [
      "Ram Ganga Agro is a working farm. Raktshali and wheat are among the crops grown here. Other crops will be named when the farm confirms them.",
    ],
    status: "draft",
    href: "/our-farm",
    linkLabel: "Discover our story",
  },
  {
    id: "home-natural",
    page: "home",
    kind: "from-the-land",
    eyebrow: "The approach",
    title: "Natural farming.",
    paragraphs: [
      "Ram Ganga Agro practices natural farming.",
      "The description of the work is still to come.",
    ],
    status: "draft",
    mediaId: "seeds",
    href: "/our-farm/practices",
    linkLabel: "Read about the practice",
  },
  {
    id: "home-wheat",
    page: "home",
    kind: "crop-chapter",
    eyebrow: "Wheat",
    title: "Wheat, grown here.",
    paragraphs: [
      "Wheat is grown at Ram Ganga Agro. The story is still being written.",
    ],
    status: "draft",
    mediaId: "wheat",
    href: "/grow/wheat",
    linkLabel: "Read the wheat story",
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
    eyebrow: "The practice",
    title: "Natural farming.",
    paragraphs: ["Ram Ganga Agro practices natural farming."],
    status: "draft",
    mediaId: "seeds",
  },
  {
    id: "practices-meaning",
    page: "practices",
    kind: "crop-chapter",
    title: "What it means here",
    paragraphs: ["The story is still being written."],
    status: "placeholder",
  },
  {
    id: "practices-approach",
    page: "practices",
    kind: "crop-chapter",
    title: "The approach",
    paragraphs: ["More from the field soon."],
    status: "placeholder",
  },
  {
    id: "practices-land",
    page: "practices",
    kind: "from-the-land",
    title: "Land and crops",
    paragraphs: [
      "The crops are grown on this farm. The place itself will be named when the farm is ready.",
    ],
    status: "draft",
    href: "/our-farm/the-land",
    linkLabel: "Read about the land",
  },
  {
    id: "practices-journey",
    page: "practices",
    kind: "journey-ahead",
    title: "The journey of growing",
    paragraphs: [
      "From the land, through the season, toward the table. The farm will describe the work when it is ready.",
    ],
    status: "placeholder",
    href: "/grow",
    linkLabel: "What we grow",
  },
  {
    id: "practices-field",
    page: "practices",
    kind: "field-observation",
    title: "From the field",
    paragraphs: ["More from the field soon."],
    status: "placeholder",
    mediaId: "contours",
  },
  {
    id: "farm-opening",
    page: "farm",
    kind: "opening",
    eyebrow: "Ram Ganga Agro",
    title: "A working farm.",
    paragraphs: [
      "These pages are the farm’s account of itself: the story, the land, and the practice. What has been confirmed is written plainly. What has not been shared is left open.",
    ],
    status: "draft",
  },
  {
    id: "farm-index-story",
    page: "farm-index",
    kind: "opening",
    title: "Our story",
    paragraphs: ["The people and the reason for the farm have not been published."],
    status: "placeholder",
    href: "/our-farm/story",
    linkLabel: "Read our story",
    mediaId: "mark",
  },
  {
    id: "farm-index-land",
    page: "farm-index",
    kind: "from-the-land",
    title: "The land",
    paragraphs: ["The place will be named when the farm is ready to say where it is."],
    status: "draft",
    href: "/our-farm/the-land",
    linkLabel: "Read about the land",
    mediaId: "contours",
  },
  {
    id: "farm-index-practices",
    page: "farm-index",
    kind: "crop-chapter",
    title: "Natural farming",
    paragraphs: ["Ram Ganga Agro practices natural farming."],
    status: "approved",
    href: "/our-farm/practices",
    linkLabel: "Read about the practice",
    mediaId: "seeds",
  },
  {
    id: "farm-index-growing",
    page: "farm-index",
    kind: "growing-now",
    title: "What is growing",
    paragraphs: ["Raktshali and wheat are among the crops. Each has its own page."],
    status: "draft",
    href: "/grow",
    linkLabel: "What we grow",
    mediaId: "grain",
  },
  {
    id: "farm-index-notes",
    page: "farm-index",
    kind: "field-observation",
    title: "Notes from the field",
    paragraphs: ["More from the field soon."],
    status: "placeholder",
    href: "/journal",
    linkLabel: "The journal",
    mediaId: "seasonal-line",
  },
  {
    id: "grow-now",
    page: "grow",
    kind: "growing-now",
    title: "What we grow.",
    paragraphs: [
      "Raktshali and wheat are grown at Ram Ganga Agro. Another crop is added when the farm confirms its name.",
    ],
    status: "draft",
  },
];

export function chaptersFor(page: string): StoryChapter[] {
  return storyChapters.filter((chapter) => chapter.page === page);
}

export function chapterById(id: string): StoryChapter | undefined {
  return storyChapters.find((chapter) => chapter.id === id);
}

/**
 * The shape of the public story. These are reading stops, not a claim that
 * a particular task happens on the farm.
 */
export const landToTable: { n: string; title: string; text: string; href: string }[] = [
  {
    n: "01",
    title: "The land",
    text: "The place the season begins.",
    href: "/our-farm/the-land",
  },
  {
    n: "02",
    title: "Growing",
    text: "The work, still to be described.",
    href: "/our-farm/practices",
  },
  {
    n: "03",
    title: "The crop",
    text: "What the farm has named.",
    href: "/grow",
  },
  {
    n: "04",
    title: "A record",
    text: "Notes, when there is something to write.",
    href: "/journal",
  },
  {
    n: "05",
    title: "The table",
    text: "Where the story is headed.",
    href: "/#follow",
  },
];
