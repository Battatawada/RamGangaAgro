# Tokens

Implement these as CSS variables on `:root`, then map them into Tailwind if Tailwind is the styling layer. Do not invent a second palette in component files.

## Colour

Use the values and the contrast notes in `colors.json`.

| Token | Use |
|---|---|
| `--paper` | Page background |
| `--paper-raised` | Header, cards, inputs |
| `--ink` | Headings and body |
| `--ink-muted` | Supporting paragraphs |
| `--green` | Eyebrows, primary buttons, key rules, the dark crop band |
| `--raktshali` | One accent: a 1px rule, the harvest status, a single word, focus |
| `--clay` | Eyebrows that are not green, only at 16px and up |
| `--clay-deep` | Captions and meta |
| `--grain` | A contour stroke or a harvest numeral. Never text on paper |
| `--line` | Dividers |

The page background is paper. One homepage band is green. Everything else stays paper or raised paper. Do not stripe the page in alternating colours.

## Type

Fraunces for headings. Outfit for everything a person scans or fills in. Scales are in `typography.json`.

Headings use `clamp`. Body does not go below `1.0625rem`.

Prose measure is `40rem`. A heading may be wider than the paragraph under it, up to `22ch` for the display line so the hero breaks in two or three lines on purpose:

> Good food begins  
> long before the table.

## Space, width, radius

Spacing is a 4px scale. Section padding is 96px desktop and 64px below 640px. Page content is 1120px. Header may run to 1280px. Prose is 680px.

Radius on controls and media is 2px. No pill buttons. No drop shadows.

## Breakpoints

640, 768, 1024, 1280. See `breakpoints.json`. The layout changes at 1024px, when the hero splits and the journey becomes a row.
