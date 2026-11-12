# 06 — Homepage specification

Open `design/mockups/homepage.html` beside this file. The mockup is the composition. This file is the behaviour. Copy marked DRAFT must be approved or replaced. Do not add sections.

Sequence, final:

1. Header
2. Hero
3. Introduction
4. What we grow
5. Journey
6. Raktshali band
7. Journal
8. Follow
9. Footer

Background is paper throughout, except the Raktshali band, which is green. Sections do not alternate colours. The transition between sections is space, 96px desktop, 64px below 640px, and sometimes a hairline. There is no wave, no diagonal, no parallax.

## Header

Sticky, 72px, paper, 1px line on the bottom. Left: wordmark linking home. From 1024px: Our Farm, What We Grow, Journal, Contact. Below 1024px: a Menu button that opens a full-viewport paper panel. Links in that panel are Fraunces, clamp(2rem, 6vw, 2.75rem), stacked, with 24px between them. Escape and the Close button dismiss it. Focus moves to the first link when it opens and returns to Menu when it closes. The page underneath does not scroll while the panel is open.

## 1. Hero

**Purpose.** Say the name and the line. Offer two ways in. Hold a picture slot that is a drawing today.

**Desktop, from 1024px.** Grid `1.15fr 0.85fr`, gap 48px, align end, max-width 1120px, padding 72px 32px 96px, min-height `calc(100svh - 72px)`.

Left column, max 640px:

- Eyebrow: RAM GANGA AGRO
- `h1`: Good food begins long before the table.
- Deck, DRAFT: A farm, its crops, and the journey from the land to the table.
- Primary button: Explore our farm → `/our-farm`
- Quiet button: What we grow → `/grow`

The `h1` should break after “begins” by a max-width of about 11ch, not by a `<br>` that fails on small screens. If the line fits in two lines at 1120px, that is correct. Do not force a break with a tag.

Right column: raised paper, radius 2px, min-height 520px, the panicle SVG centred, max-width 420px. Caption under it, clay-deep: “Illustration, until the farm’s own picture is ready.”

**When media kind becomes image or video.** The right column keeps the same box. Image uses `object-fit: cover` and the caption becomes the photograph’s alt context, not the illustration sentence. Video is muted, plays inline, has a visible pause button, and a poster. Reduced motion shows the poster and does not autoplay.

**Mobile menu.** The static Menu button in `design/mockups/homepage.html` is not the interaction. Implement the dialog in this spec and in doc 16: full-viewport paper panel, Fraunces links, focus moved to the first link, focus trapped, Escape and Close return focus to Menu, the page underneath `inert` and not scrollable. The Raktshali mockup hides the nav below 1024px without drawing that panel. The panel is still required on every page.

**Mobile hero.** One column. Type first. The art follows, min-height 320px. Buttons wrap. They stack with 12px between them only under 360px, and they stay 48px tall.

**Do not.** A shop button. A video with sound. A stock photo. A discount. A logo carousel. The words “red rice” or “traditional” until the farm confirms them.

## 2. Introduction

Eyebrow: The farm. `h2`: Every grain has a beginning.

DRAFT body, max 40rem: Ram Ganga Agro is a working farm. This is the place to learn what is grown here, and how the season moves from the field toward the table.

Text link: Discover our story → `/our-farm`.

No image in Phase 1. When a photograph exists, it may sit to the right from 1024px, ratio 4/5, without changing the heading. Until then, do not reserve an empty grey box. Absence is cleaner than a hole.

## 3. What we grow

Eyebrow: Our harvest.

From 1024px, two columns, `0.9fr 1.1fr`, gap 48px. The card is first in the DOM so mobile shows the crop before the explanation. Visually on desktop the card is left.

Card: raised paper, 1px line. Media area ratio 4/5, background `#F3E6E4`. The panicle drawing sits centred in that area, at most 180px wide, so the panel is a composed illustration and not an empty colour field. Status “Currently growing” sits at the top left, over the blush. The image alt is empty because the card title names the crop and the drawing is repeated from the hero. The hero illustration keeps the descriptive alt. Title: Raktshali rice. One sentence: Grown at Ram Ganga Agro. It is not for sale. The whole card links to `/grow/raktshali-rice`. Hover: border colour green. No price. No button on the card. Do not write “red”, “traditional”, or a place name in this sentence.

Right column `h2`: What we grow. Body: One crop is enough to begin. Another is added when the farm is growing it.

If a second real crop is added later, the right column becomes a second card and the heading moves above both. Do not design a three-up grid of placeholders.

## 4. Journey

Eyebrow: From the land to the table. `h2`, DRAFT: Five steps, and no more than we can stand behind.

From 1024px, five columns, gap 24px. Each step has a 1px green top border, a burgundy numeral (01–05) in Fraunces 13px, an `h3`, and one line.

1. The land — Where the season starts. Links to `/our-farm/the-land`.
2. Growing — Soil, water, and time. Links to `/our-farm/practices`.
3. Harvest — When the field is ready. Links to `/grow/raktshali-rice#harvest`.
4. Preparation — How the grain is handled. Links to `/grow/raktshali-rice#preparation`.
5. The table — The harvest, brought home. Links to `/#follow`.

Below 1024px this is a vertical list with the same border. Contour SVG may sit behind the section at 8% opacity, `aria-hidden`, and it must not reduce text contrast. If it does, omit it.

These steps do not claim a method. They name the path. Detail waits for the farm.

## 5. Raktshali band

Full-bleed green. Inner grid two columns from 1024px, one column below. Padding matches other sections.

Left: a 48×1px burgundy rule, eyebrow RAKTSHALI in `#F4EFE6`. `h2` in paper: Raktshali, still in the field.

Right, paper-coloured body: This rice is growing at Ram Ganga Agro. It is not for sale. The page names the crop and leaves room for the farm’s own account.

Link: Read the crop’s story → `/grow/raktshali-rice`, paper colour, underline.

No pack shot. No rupee amount. No “notify me” here. That job belongs to Follow.

## 6. Journal

Eyebrow: From the farm. A single empty panel, max-width 40rem, raised paper, 1px line, padding 48px.

`h2`: The journal is just beginning. Body: When there is a season to record, it will be recorded here.

If one real post exists, this section becomes one `JournalCard` and a text link to `/journal`. It never shows three “coming soon” cards.

## 7. Follow

Two columns from 1024px, aligned to the end. Left: eyebrow Harvest notes. `h2`: Follow the journey. Body, DRAFT: A note when there is something to say about the season, and when a harvest is ready to leave the farm. Nothing else.

Right: `NewsletterForm`. Email field. Checkbox, required: “Send me harvest notes when the farm starts sending them. I can unsubscribe at any time.” Button: Join the farm journal. The checkbox is the consent. A pre-checked box is forbidden. Submitting goes to `/follow` on success. Unsubscribe is a working page, specified in doc 11. Phase 1 does not send mail, and the form does not promise that a message is already on its way.

Under the form, a text link to `/privacy`.

## 8. Footer

Top border. Name, rgagro.me, the four links, Privacy, Terms, and Unsubscribe. Padding 48px 32px 64px.

## Accessibility

One `h1`. Sections use `h2`. Journey steps use `h3`. Buttons and links have real text. The illustration has an alt that says it is a drawing. The follow form’s error messages are in a live region. See `14-accessibility.md`.

## Farm must supply before any of this is treated as final copy

Confirmation of the hero deck, the introduction sentence, and the spelling Raktshali. The structure does not wait on those. The words do.
