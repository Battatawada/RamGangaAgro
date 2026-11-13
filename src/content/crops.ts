/**
 * Public crops. A crop is something grown at the farm. It is not a product.
 * `productSlug` stays null until the farm decides to offer that crop for sale.
 * A null field is unknown. The page shows an honest gap instead of a guess.
 */
export type CropStatus =
  | "currently_growing"
  | "seasonal_harvest"
  | "coming_soon"
  | "available_soon";

export const statusLabels: Record<CropStatus, string> = {
  currently_growing: "Currently growing",
  seasonal_harvest: "Seasonal harvest",
  coming_soon: "Coming soon",
  available_soon: "Available soon",
};

/** Visual family. It changes the panel behind the drawing, not the brand palette. */
export type CropTone = "raktshali" | "wheat" | "farm";

export type CropFact = { label: string; value: string };

export type CropChapter = {
  id: string;
  title: string;
  paragraphs: string[] | null;
};

export type CropUpdate = {
  title: string;
  paragraphs: string[];
};

export type CropAvailability = {
  title: string;
  paragraphs: string[];
};

export type Crop = {
  slug: string;
  name: string;
  summary: string;
  /** Null when the farm has not named the current season. */
  status: CropStatus | null;
  purchasable: boolean;
  pricePaise: number | null;
  /** Set only when this crop is explicitly offered for sale. */
  productSlug: string | null;
  description: string[] | null;
  /** Heading used only when `description` is present. */
  essayTitle: string;
  facts: CropFact[] | null;
  onThisFarm: string[] | null;
  inTheField: string[] | null;
  harvest: string[] | null;
  preparation: string[] | null;
  mediaId: string;
  heroMediaId: string;
  story: string[] | null;
  chapters: CropChapter[];
  season: string | null;
  fieldMediaId: string | null;
  photographIds: string[];
  updates: CropUpdate[];
  observations: string[] | null;
  availability: CropAvailability;
  /** A future pack or trace note. Null when the farm has not said this. */
  laterNote: string[] | null;
  tone: CropTone;
};

export const crops: Crop[] = [
  {
    slug: "raktshali-rice",
    name: "Raktshali rice",
    summary: "Grown at Ram Ganga Agro. It is not for sale.",
    status: "currently_growing",
    purchasable: false,
    pricePaise: null,
    productSlug: null,
    description: null,
    essayTitle: "The rice.",
    facts: null,
    onThisFarm: null,
    inTheField: null,
    harvest: null,
    preparation: null,
    mediaId: "panicle",
    heroMediaId: "panicle",
    story: null,
    chapters: [],
    season: null,
    fieldMediaId: null,
    photographIds: [],
    updates: [],
    observations: null,
    availability: {
      title: "Harvest notes, when the grain is ready.",
      paragraphs: [
        "This rice is not available to buy. If you want to hear when that changes, follow the farm.",
      ],
    },
    laterNote: [
      "In time, a pack may carry a code. That code will open the record of the harvest it came from: the crop, the date, and what the farm chooses to share.",
    ],
    tone: "raktshali",
  },
  {
    slug: "wheat",
    name: "Wheat",
    summary: "Grown at Ram Ganga Agro.",
    status: null,
    purchasable: false,
    pricePaise: null,
    productSlug: null,
    description: null,
    essayTitle: "The crop.",
    facts: null,
    onThisFarm: null,
    inTheField: null,
    harvest: null,
    preparation: null,
    mediaId: "wheat",
    heroMediaId: "wheat",
    story: null,
    chapters: [],
    season: null,
    fieldMediaId: null,
    photographIds: [],
    updates: [],
    observations: null,
    availability: {
      title: "Availability.",
      paragraphs: ["The story is still being written.", "More from the field soon."],
    },
    laterNote: null,
    tone: "wheat",
  },
];

export function getCrop(slug: string): Crop | undefined {
  return crops.find((crop) => crop.slug === slug);
}

export function otherCrops(slug: string): Crop[] {
  return crops.filter((crop) => crop.slug !== slug);
}

export const cropPanelClass: Record<CropTone, string> = {
  raktshali: "bg-raktshali-soft",
  wheat: "bg-paper-raised",
  farm: "bg-green-soft",
};
