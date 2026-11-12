# 09 — Raktshali rice

Open `design/mockups/raktshali.html`. URL: `/grow/raktshali-rice`.

This is an essay with a status. It is not a product detail page that happens to have no button. Commerce, when it exists, is a block at the end. The essay stays.

## Verified, and safe to publish

- The farm grows a rice it calls Raktshali.
- It is not for sale.
- The page must not show a price.

## Not verified — do not publish as fact

Spelling variants, colour of this farm’s grain, the word “traditional”, where in India it grows, why the farm chose it, season dates, yield, milling, cooking times, nutrition, medicinal use, GI, organic status, and any comparison with other rices. Ayurvedic reputation of a rice called Raktashali is not a claim about this farm’s harvest. Leave it out.

Public copy in Phase 1 may say the name, that it is grown at Ram Ganga Agro, that it is currently growing, and that it is not for sale. Nothing more about the grain.

The content file has slots for those facts. Empty slots render nothing. They do not render “TBD” in the public page. The mockup’s pink boxes are for the design review only. The live page omits an empty section.

## Section order

1. Breadcrumb: What we grow / Raktshali rice
2. Opener
3. What it is
4. On this farm
5. In the field
6. Harvest (`#harvest`)
7. Preparation (`#preparation`)
8. From this harvest, later
9. Availability

## 1. Opener

Desktop: two columns, align end, same proportions as the hero (`1.1fr 0.9fr`). The structural change is at 1024px, as in the design system. Do not use 800px. Left: status eyebrow Currently growing, in burgundy. `h1` Raktshali rice. Deck: Grown at Ram Ganga Agro. It is not for sale.

Right: blush `#F3E6E4`, min-height 460px, panicle centred. Caption: drawing, not a photograph. The caption does not call the grain red.

Mobile, below 1024px: type, then the art, min-height 300px. The header uses the same mobile menu as the homepage.

## 2. What it is

`h2`: The rice.

If the farm has not written a description, this section is omitted. Do not fill it with encyclopedia text.

When they write it, 680px prose, two or three paragraphs. Optional facts as a definition list, only for values they supplied: colour, grain length, season. The list is a row: a 180px clay-deep label and the value. On small screens the label stacks above the value. A hairline between rows.

## 3. On this farm

`h2`: On this farm.

Omitted until they answer why this rice is grown here. When present, prose only.

## 4. In the field

`h2`: In the field.

Omitted until there is a photograph or a paragraph about the season in the ground. A future image is 4/5 or 3/2, with alt they write. It does not stretch full bleed.

## 5. Harvest

`id="harvest"`. `h2`: Harvest.

Until a batch exists: one sentence, DRAFT: When a harvest is recorded, its season will be named here.

When a `Harvest` row exists and is marked public: batch code, date, and the field label they approve. Notes if they wrote them. No customer data. This block is the same data `/harvest/[batch]` will show later. Phase 1 does not create that route. The anchor is enough.

## 6. Preparation

`id="preparation"`. `h2`: Preparation.

Omitted until the farm describes how the grain is handled or cooked. No invented recipes. No “serves 4.”

## 7. From this harvest, later

A quiet explanation, always shown, because it is about the site rather than a fake batch:

DRAFT: In time, a pack may carry a code. That code will open the record of the harvest it came from: the crop, the date, and what the farm chooses to share.

No QR widget. No sample code. No scanner.

## 8. Availability

Raised paper, 1px line, padding 28px.

`h2`: Harvest notes, when the grain is ready.

Body: This rice is not available to buy. If you want to hear when that changes, follow the farm.

A text link to `/#follow` on the homepage. Do not embed a second email form.

**Future, same block, flags on.** If `STOREFRONT_ENABLED` and the variant is purchasable: show price in rupees from integer paise, pack sizes as a fieldset with a legend, and stock as words (“In stock” / “Not in stock”), never a raw quantity if the farm prefers not to show a number. The add-to-cart button renders only when `CHECKOUT_ENABLED` is also true. The button is a Server Action. The displayed price is read from the database in that action, not from the button’s value. While checkout is off, the price may show and the sentence remains “Not available to buy.” Phase 1 ships neither the price nor the button.

## Accessibility

Status is text. The definition list is a `dl`. Skip links are the site-wide one. The future variant fieldset has a legend “Pack size.”

## Content owner

The farm. The implementer does not write the crop essay.
