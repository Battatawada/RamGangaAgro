# 16 — Component specifications

Do not build components that are marked Later. Visual rules are in `design/components.md`.

Shared rules: server components by default. Client only when a menu, a form pending state, or Clerk’s widget requires it. No component reads a role from props that originated in the browser and then trusts it for a mutation.

## SiteHeader — Phase 1

Links from a single nav config. Cart and account are entries in that config with `flag` set, and they render only when the flag is true. Phase 1: four links. Mobile dialog as specified. Current page indicated with `aria-current="page"`.

## SiteFooter — Phase 1

Name, domain, nav, privacy, terms. Same flag rule. No social row until URLs exist.

## MediaHero — Phase 1

Props: `kind: "illustration" | "image" | "video"`, `src`, `alt`, `poster`, `caption`. Illustration renders the SVG or an `img` of it. Image uses cover inside the aspect ratio. Video requires `poster`, `muted`, `playsInline`, `controls` or a pause button, and respects reduced motion by not autoplaying. The box size is the parent’s. This component does not include the headline.

## SectionHeading — Phase 1

Props: `eyebrow`, `title`, `as` (`h1` or `h2`). Eyebrow is a `p`. Title is the chosen heading. Optional `lede`.

## Button and text links — Phase 1

`Button` renders `<a>` or `<button>` from an `href` prop. Variants `primary` and `quiet`. It does not render `submit` styles differently except `type`.

## FarmIntroduction — Phase 1

The homepage section 2. Props: eyebrow, title, body, href, linkLabel. No image prop required. Optional `media` later.

## ProductCard — Phase 1

Props: `name`, `summary`, `href`, `status`, `media`, `pricePaise | null`, `purchasable`. Renders status, name, summary, media. Renders price only if `STOREFRONT_ENABLED && pricePaise != null && purchasable`. Renders nothing that says Add to cart. The later cart button is a sibling, not a rewrite: when `CHECKOUT_ENABLED && purchasable`, an action button is added. Phase 1 never passes that condition.

## ProductGrid — Phase 1

A list of cards. `ul`/`li`. One column, or the horizontal card layout from spec 08 when there is a single crop. Two columns from 768px when there are two or more.

## HarvestStatus — Phase 1

The small uppercase label. Props: `status` union of the four strings in spec 08. Colour burgundy. Text is the status. Used inside the card and the crop page.

## FarmStory — Phase 1

A prose section: heading, paragraphs, optional link. Used on Our Farm. Does not accept raw HTML.

## FarmJourney — Phase 1

Five items: `n`, `title`, `text`, `href`. The list in spec 06. Renders an `ol`.

## JournalCard — Phase 1, used when a post exists

Props: `title`, `href`, `date`, `kind`, `excerpt`, `media | null`. The empty state is not this card. It is a separate block in the page, so the card has no “coming soon” variant.

## JournalEmpty — Phase 1

Heading and sentence. Used on the homepage and `/journal`.

## NewsletterForm — Phase 1

Client wrapper around a Server Action. Fields in spec 11. Props: `source`. Pending, error, and success states. Success navigates to `/follow`. Consent required. Honeypot named `company` and hidden with CSS that still leaves it out of the accessibility tree (`hidden` or `aria-hidden` plus `tabIndex={-1}` and off-screen is worse; use the `hidden` attribute so it is not filled by a person, and reject if it is non-empty).

## ContactForm — Phase 1

Same pattern. Fields in spec 11. Success replaces the form. No navigation away, so the confirmation is in context.

## EditorialImage — Phase 1

Figure, aspect ratio prop, caption, alt required. If `src` is null, render nothing. Do not render a grey placeholder.

## ImagePlaceholder — do not build

The earlier name suggested a fake frame. Absence is the placeholder. Skip this component.

## Breadcrumbs — Phase 1

Props: `items: { label, href? }[]`. Last item has no href.

## SkipLink — Phase 1

## Later, do not build in Phase 1

`Price`, `AddToCartButton`, `CartLine`, `CheckoutForm`, `AccountNav`, `AddressForm`, `OrderSummary`, `AdminShell`, `AuditTable`, `HarvestQr`. Spec them only so the crop page’s last block has a place to land:

**Price.** Formats `pricePaise` as INR with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`. Reads the number. Does not accept a string from the client as the amount to charge.

**AddToCartButton.** Rendered only behind the checkout flag. Calls a Server Action that reloads the variant price.

## Dependencies

Header and footer depend on the nav config and the flags. Cards depend on HarvestStatus and MediaHero or a static media frame. Forms depend on Zod schemas and the rate limiter. Nothing in Phase 1 depends on a payment SDK.
