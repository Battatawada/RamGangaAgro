/**
 * Public crop content. Phase 1 reads crops from this module, not from the
 * database, so the site renders without a product row. Fields are shaped like
 * the future `products` table in docs/19.
 *
 * Only four things may be said in public about the crop: its name, that it is
 * grown at Ram Ganga Agro, that it is currently growing, and that it is not
 * for sale. Every other slot is null until the farm supplies it. A null slot
 * renders nothing. It never renders "TBD".
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

export type CropFact = { label: string; value: string };

export type Crop = {
  slug: string;
  name: string;
  summary: string;
  status: CropStatus;
  purchasable: boolean;
  pricePaise: number | null;
  /** The essay. Each slot stays null until the farm writes it. */
  description: string[] | null;
  facts: CropFact[] | null;
  onThisFarm: string[] | null;
  inTheField: string[] | null;
  harvest: string[] | null;
  preparation: string[] | null;
};

export const crops: Crop[] = [
  {
    slug: "raktshali-rice",
    name: "Raktshali rice",
    summary: "Grown at Ram Ganga Agro. It is not for sale.",
    status: "currently_growing",
    purchasable: false,
    pricePaise: null,
    description: null,
    facts: null,
    onThisFarm: null,
    inTheField: null,
    harvest: null,
    preparation: null,
  },
];

export function getCrop(slug: string): Crop | undefined {
  return crops.find((crop) => crop.slug === slug);
}
