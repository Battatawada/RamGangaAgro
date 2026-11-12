# 05 — Information architecture

## Public navigation

Our Farm · What We Grow · Journal · Contact

The wordmark goes to `/`. There is no Shop, no cart, and no account link while the flags are false.

## Phase 1 routes

| Path | Page | Job |
|---|---|---|
| `/` | Home | The visit, in one scroll |
| `/our-farm` | Our Farm | The short introduction, with links into the chapters |
| `/our-farm/story` | Our story | Who, when the farm is ready to say |
| `/our-farm/the-land` | The land | Place, without an invented map |
| `/our-farm/practices` | Practices | Only confirmed methods |
| `/grow` | What we grow | The crop index. One card today |
| `/grow/raktshali-rice` | Raktshali rice | The editorial crop page |
| `/journal` | Journal | Empty state until a post exists |
| `/journal/[slug]` | Entry | A real post, or 404 |
| `/contact` | Contact | A letter |
| `/follow` | Follow | Confirmation after a valid signup |
| `/unsubscribe` | Unsubscribe | Self-service removal. Same response whether or not the address was listed |
| `/privacy` | Privacy | Required before the form collects an email |
| `/terms` | Terms | Required beside privacy |
| `/sign-in/[[...sign-in]]` | Clerk | Unlinked. Invite-only |
| `/sign-up/[[...sign-up]]` | Clerk | Unlinked. Invitation ticket only |

Unknown journal slugs call `notFound()`. Dormant routes also call `notFound()` and are not linked:

`/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/account`, `/account/orders/[id]`, `/admin`, `/harvest/[batch]`.

`/follow` is the thank-you page, not a second marketing page. The form itself lives on the homepage and in the footer.

## Why the farm is three child pages

Our Farm is one screen that can be read in a minute. Story, land, and practices are real URLs so a later paragraph has a home. In Phase 1 each child page is short and honest. They are not thin duplicates of the parent. If the farm has not supplied a fact, the page says what is still to come in one sentence, then returns the reader to what is known.

## Footer

Ram Ganga Agro, rgagro.me, the four nav items, Privacy, Terms, and Unsubscribe. No social icons until the farm names real profiles. No shop links.

## Future, not built

When `STOREFRONT_ENABLED` is true, What We Grow can show a price on a card and a Shop link may appear. The crop essay stays at `/grow/raktshali-rice`. A shop index, if it is ever distinct from the crop index, is `/shop`. Cart and checkout appear only with `CHECKOUT_ENABLED`. Accounts appear only with `ACCOUNTS_ENABLED`. `/harvest/[batch]` appears when a real batch code exists and the farm chooses to print it. It is a public read of non-sensitive harvest fields, never of a customer.

## Breadcrumbs

On every page except home. Outfit 14px, clay-deep. Pattern: What we grow / Raktshali rice. The current page is text, not a link.

## SEO shape

One `h1` per page. The homepage `h1` is the brand line, not the wordmark. Titles: `Raktshali rice — Ram Ganga Agro`. Description written from real copy only. `sitemap.xml` lists Phase 1 public URLs and omits dormant ones. `robots` allows the public pages.
