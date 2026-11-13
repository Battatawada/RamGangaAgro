/**
 * Pictures, films, and drawings. Pages ask for an id. The file behind that id
 * can change from a drawing to a photograph without the layout changing.
 *
 * A decorative asset is not a claim about the farm. Alt text for a drawing
 * says that it is a drawing.
 */

export type MediaKind = "illustration" | "image" | "video";

export type MediaAsset = {
  id: string;
  kind: MediaKind;
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  /** True when the asset must not be announced. The page sets alt to empty. */
  decorative?: boolean;
};

export const media = {
  panicle: {
    id: "panicle",
    kind: "illustration",
    src: "/illustrations/panicle.svg",
    alt: "Line drawing of a rice panicle. This is an illustration, not a photograph of the farm.",
    caption: "Illustration, until the farm’s own picture is ready.",
  },
  contours: {
    id: "contours",
    kind: "illustration",
    src: "/illustrations/contours.svg",
    alt: "",
    caption:
      "Field lines, drawn until a photograph is ready. Not a map, and not a picture of the farm.",
    decorative: true,
  },
  mark: {
    id: "mark",
    kind: "illustration",
    src: "/illustrations/mark.svg",
    alt: "",
    decorative: true,
  },
  grain: {
    id: "grain",
    kind: "illustration",
    src: "/illustrations/grain.svg",
    alt: "",
    decorative: true,
  },
  "seasonal-line": {
    id: "seasonal-line",
    kind: "illustration",
    src: "/illustrations/seasonal-line.svg",
    alt: "",
    decorative: true,
  },
  "field-divider": {
    id: "field-divider",
    kind: "illustration",
    src: "/illustrations/field-divider.svg",
    alt: "",
    decorative: true,
  },
  wheat: {
    id: "wheat",
    kind: "illustration",
    src: "/illustrations/wheat.svg",
    alt: "Line drawing of a wheat head. This is an illustration, not a photograph of the farm.",
    caption: "Illustration, until the farm’s own picture is ready.",
  },
  seeds: {
    id: "seeds",
    kind: "illustration",
    src: "/illustrations/seeds.svg",
    alt: "",
    decorative: true,
  },
  soil: {
    id: "soil",
    kind: "illustration",
    src: "/illustrations/soil.svg",
    alt: "",
    caption: "A drawing of soil and stubble. Not a picture of the farm.",
    decorative: true,
  },
  diagram: {
    id: "diagram",
    kind: "illustration",
    src: "/illustrations/diagram.svg",
    alt: "",
    decorative: true,
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof media;

export function mediaById(id: string): MediaAsset | undefined {
  if (id in media) return media[id as MediaId];
  return undefined;
}
