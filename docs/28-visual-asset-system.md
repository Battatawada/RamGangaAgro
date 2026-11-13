# 28 — Visual asset system

The drawings are original line work for Ram Ganga Agro. They are not copies of another farm’s illustrations, and they are not photographs of this farm. Stock photography is not a stand-in. The shot list in `design/imagery-guidelines.md` still has no files.

## Files

| Id | File | Role |
|---|---|---|
| `panicle` | `public/illustrations/panicle.svg` and `design/illustrations/panicle.svg` | Hero and crop drawing until a photograph exists |
| `contours` | `contours.svg` | Quiet field lines. Not a map |
| `mark` | `mark.svg` | The small panicle used as the wordmark’s mark |
| `grain` | `grain.svg` | Three grain marks and a stem, for a seasonal note |
| `seasonal-line` | `seasonal-line.svg` | One seasonal stroke |
| `field-divider` | `field-divider.svg` | A short run of field lines |

`src/content/media.ts` is the registry. A page asks for an id. Decorative assets set `decorative: true` and are rendered by `DecorativeMark` with `alt=""` and `aria-hidden="true"`. An asset that is the subject of a figure keeps an alt that says it is a drawing.

## How to add one

1. Draw it. Stroke around 1 to 1.25, round caps, colours only from the approved tokens: green `#1C3328`, burgundy `#6E2A32`, line `#CDBFAE`. No shadows, no gradients, no texture copied from a reference site.
2. Save the same file under `design/illustrations/` and `public/illustrations/`.
3. Register it in `media`. If it is ornament, `decorative: true` and an empty alt. If it stands in for a photograph, the alt must say it is an illustration.
4. Use it through `mediaById` or `DecorativeMark`. Do not paste a new `<svg>` into a page.
5. One ornament per section is enough. The drawings are not a pattern fill.

## Motion

The approved motion rules in `docs/13-interaction-and-motion.md` still hold. These drawings do not animate. Motion on this site explains a change, such as the menu opening, and `prefers-reduced-motion` already shortens those transitions. A drifting illustration would be decoration, so it is not added.

## What the drawings must not do

They must not be described as pictures of the farm. They must not imply a certification, a yield, a colour of grain the farm has not confirmed, or a person. They must not sit behind text in a way that drops the text below the approved contrast. The contour lines sit after the journey copy, not underneath it.
