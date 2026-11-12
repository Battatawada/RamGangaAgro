# 08 — What we grow

## `/grow`

**Visitor.** Someone who wants to know the crop, or who may return when there is something to buy.

**h1:** What we grow.

Deck, DRAFT: The harvest, as it is. One crop is growing. It is not yet for sale.

Then a `ProductGrid` that is a single `ProductCard` for Raktshali rice.

- Status: Currently growing
- Title: Raktshali rice
- Summary: Grown at Ram Ganga Agro. It is not for sale.
- Href: `/grow/raktshali-rice`
- Media: blush field `#F3E6E4` with the panicle centred, max-width 180px, status overlaid. Same composition as the homepage card.
- Commerce: hidden. The card component must accept a price and still not render it while `STOREFRONT_ENABLED` is false

**Desktop.** The grid is one column at a max of 720px, left aligned under the heading, not a centred lonely card in a sea of space. The card is horizontal from 768px: media 4/5 at 280px wide, text beside it. Below 768px the media stacks on top, full width of the container.

**Empty.** If the content list were ever empty, the page would say: The farm has not published a crop yet. That state should not occur in Phase 1, because Raktshali is real. Do not add a second card to avoid the empty look.

**Adding a crop later.** A second entry in the content collection. The grid becomes two columns from 768px. No redesign.

## Status labels

| Status | Meaning | Shows a price when the storefront flag is on |
|---|---|---|
| Currently growing | In the field | Only if the farm also marks it purchasable |
| Seasonal harvest | A harvest exists | Same |
| Coming soon | Named, not yet in the field | No |
| Available soon | Harvested or packed, not on sale yet | No |

Phase 1 uses Currently growing. Purchasable is a separate boolean, default false, and the storefront flag must also be true.

## Not on this page

Filters, sort, search, badges like Trending, wishlist, variant dropdowns, add to cart.
