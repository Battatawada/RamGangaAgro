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
  /** Intrinsic size from the SVG viewBox so layout stays stable before CSS scales. */
  width: number;
  height: number;
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
    alt: "Line drawing of a Raktshali (Rakthashali) rice panicle. Illustration, not a farm photograph.",
    width: 420,
    height: 560,
    caption: "Illustration, until the farm’s own picture is ready.",
  },
  contours: {
    id: "contours",
    kind: "illustration",
    src: "/illustrations/contours.svg",
    alt: "",
    width: 1200,
    height: 640,
    caption:
      "Field lines, drawn until a photograph is ready. Not a map, and not a picture of the farm.",
    decorative: true,
  },
  mark: {
    id: "mark",
    kind: "illustration",
    src: "/illustrations/mark.svg",
    alt: "",
    width: 64,
    height: 64,
    decorative: true,
  },
  grain: {
    id: "grain",
    kind: "illustration",
    src: "/illustrations/grain.svg",
    alt: "",
    width: 120,
    height: 56,
    decorative: true,
  },
  "seasonal-line": {
    id: "seasonal-line",
    kind: "illustration",
    src: "/illustrations/seasonal-line.svg",
    alt: "",
    width: 360,
    height: 40,
    decorative: true,
  },
  "field-divider": {
    id: "field-divider",
    kind: "illustration",
    src: "/illustrations/field-divider.svg",
    alt: "",
    width: 640,
    height: 40,
    decorative: true,
  },
  wheat: {
    id: "wheat",
    kind: "illustration",
    src: "/illustrations/wheat.svg",
    alt: "Line drawing of a wheat head. This is an illustration, not a photograph of the farm.",
    width: 250,
    height: 600,
    caption: "Illustration, until the farm’s own picture is ready.",
  },
  seeds: {
    id: "seeds",
    kind: "illustration",
    src: "/illustrations/seeds.svg",
    alt: "",
    width: 220,
    height: 72,
    decorative: true,
  },
  soil: {
    id: "soil",
    kind: "illustration",
    src: "/illustrations/soil.svg",
    alt: "",
    width: 800,
    height: 180,
    caption: "A drawing of soil and stubble. Not a picture of the farm.",
    decorative: true,
  },
  diagram: {
    id: "diagram",
    kind: "illustration",
    src: "/illustrations/diagram.svg",
    alt: "",
    width: 720,
    height: 120,
    decorative: true,
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaId = keyof typeof media;

export function mediaById(id: string): MediaAsset | undefined {
  if (id in media) return media[id as MediaId];
  return undefined;
}
