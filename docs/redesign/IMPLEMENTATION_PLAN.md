# Implementation plan

This file is the source of truth for the redesign. [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) is the visual contract. [REFERENCE_VERIFICATION.md](REFERENCE_VERIFICATION.md), [ADDITIONAL_DESIGN_REFERENCES.md](ADDITIONAL_DESIGN_REFERENCES.md), and [DESIGN_DIRECTION_COMPARISON.md](DESIGN_DIRECTION_COMPARISON.md) are the evidence. If an older note in `docs/` disagrees with this file on layout, this file wins. The rule against invented farm facts in [docs/README.md](../README.md) still wins over both.

Do not turn selling on as part of building this. The five commerce flags stay false in production unless `ALLOW_PRODUCTION_FEATURE_FLAGS=true`, and that variable stays unset until the launch gate at the end.

## Decisions already approved

- Keep Next.js 16, React 19, Tailwind 4, Drizzle, Postgres, Clerk, Zod, and the existing security headers, rate limits, and webhook idempotency.
- One app. The shop stays at `/shop` and `/shop/[slug]`. No subdomain.
- Guest checkout stays. An account is not required to pay. Clerk is not replaced. Clerk Billing is not used.
- Razorpay is the payment provider to integrate. Cashfree is the fallback if Razorpay declines the farm. Stripe is not the Indian launch path. A success redirect never marks an order paid.
- Prices stay integer paise, loaded on the server. The client sends a variant id and a quantity.
- Identity and the layout change in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): Fraunces, Noto Sans, the current palette, 2px radius, a ruled catalogue, a sticky buy bar below 1024, and a full-bleed hero only after a real photograph exists.
- No stock images. No daisyUI. No shadcn. No new font. No coupons in this release. No health claims, stars, or testimonials.
- Hindi stays the four noindex pages that already exist.
- Story pages stay in `src/content`. Products stay in Postgres.

## Decisions that need confirmation

- Legal identity: individual, proprietorship, or company. GSTIN. FSSAI number, if any. Packer name and address. Grievance phone and email. These already have empty fields. They stay empty until supplied.
- Whether prices are tax-inclusive, and the rate. Do not print “inclusive of GST” or a tax line before a chartered accountant confirms it.
- Delivery: states, PIN prefixes beyond the current default `32`, and the flat shipping amount. The current default shipping is 0 paise and the copy is empty.
- The first real SKUs: crop, weights, prices in paise, and stock. Nothing is seeded.
- Whether the circular “Ram Ganga Naturals” files in `Logos/` are a mark the site should use. The recommendation is no. The live site uses the panicle and the words Ram Ganga Agro.
- Whether any person may be photographed.
- Google sign-in. It is a Clerk Dashboard setting, not required for guest checkout.
- Opening Clerk sign-up. It is invite-only until accounts are a real launch.

## Missing assets

Every photograph in the checklist in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) is missing. The site has SVG drawings only. The logo files are illustrations, including a person, cattle, and fruit, and they are not photographs of Mamoni.

Until a pack photograph exists, a product page shows the photo slot or the crop drawing, labelled as a drawing. A variant must not be marked purchasable without a real pack photograph. That is a launch rule, not a layout rule. The layout has to look finished with the drawing still in place.

## External dependencies

- Razorpay merchant account, KYC, and a webhook secret. The GitHub Student Developer Pack does not include Razorpay. Cashfree remains the fallback if Razorpay declines the farm.
- GitHub Pro, Clerk, and Neon are already on this student ID. GitHub Pro is the repo account. Clerk is the identity provider. Neon is the database. All three stay. Renew the student verification when any of them asks.
- Vercel hosts the app. Brevo sends transactional mail. Those two accounts are separate from the student pack.
- The farm’s own photographs, prices, and policy sentences.
- A review of the privacy page before checkout collects an address. Counsel on whether the Consumer Protection e-commerce rules treat this own-site shop as an inventory e-commerce entity. A CA on GST and interstate registration.
- The pack accounts in the next section. Claim them before the matching integration, so checkout is exercised against the real services in development and preview.

## Student Developer Pack

GitHub Pro, Clerk, and Neon are already claimed on this student ID and already run the site. 1Password and Doppler were claimed on 27 November 2026. Those two accounts exist, and they are not connected to the repo yet. The workflow file currently triggers on `main`. If the default branch is `master`, point that trigger at `master` before requiring the check. Production stays invite-only in Clerk until accounts are an explicit launch. Organizations and Clerk Billing stay off. Neon stays the only database.

Claim the rows below on the pack page while the GitHub student verification is valid. The application work follows the claim. Production commerce flags stay false until the launch gate.

Renew the student verification when a partner asks again, including GitHub Pro, Clerk, and Neon. When a renewal is refused, the replacement is that product’s ordinary paid or free tier. A refused renewal is not a reason to swap the provider.

### Claim, then integrate

| Order | Offer on the pack page | What the account is for | Done when |
| --- | --- | --- | --- |
| 1 | 1Password | Dashboard passwords and recovery codes: GitHub, Clerk, Neon, Vercel, Razorpay, Brevo, Namecheap, and the services below. The 1Password account also holds the Doppler token. Account claimed 27 November 2026. | Every new partner login is an item in the farm vault. No new secret is stored only in a chat or a loose note. |
| 2 | Doppler Team | Source of application environment variables. Configs: `dev`, `preview`, `production`, `operator`. `production` syncs to the Vercel production environment. `operator` holds `DATABASE_URL_MIGRATE`, `DATABASE_URL_MESSAGES`, and `DATABASE_URL_PRIVACY` and syncs nowhere. Account claimed 27 November 2026. | Local `doppler run` starts the app. Vercel production has the app secrets and does not have the operator URLs. |
| 3 | Sentry | Errors, performance, and replays for the Next.js app. One project. Replays on the cart and checkout routes. The strict CSP allows only this project’s ingest host. | A thrown error in preview appears in Sentry with the release set to the git SHA. The client bundle scan still passes. |
| 4 | Testmail | Inbox for mail the app sends in development and preview. Brevo remains the sender. Testmail’s API key lives in the Doppler `dev` and `preview` configs only. | The sandbox guest checkout sends the order-access message, and that message is fetched through the Testmail API. |
| 5 | Simple Analytics | Site analytics, in place of the unused Google Analytics slot. 100,000 page views a month on the Starter offer. The script loads when `NEXT_PUBLIC_SIMPLE_ANALYTICS` is set. No Google tag loads beside it. | Preview records a page view and a `checkout_completed` event after a sandbox payment. The privacy page names Simple Analytics and describes Brevo, orders, and addresses. |
| 6 | Codecov | Coverage from the existing GitHub Actions workflow, including the private repo. | The commerce pull request shows a coverage report. Typecheck, lint, test, and audit still have to pass. |
| 7 | Imgbot | Compresses photographs when they land in the repo. Install the GitHub App before the first pack photograph is committed. | A committed photograph is opened as an Imgbot pull request, or Imgbot reports the file is already small enough. |
| 8 | BrowserStack | One real Android phone for the shop. The six desktop widths in this plan stay as local screenshots. BrowserStack is the extra pass on a physical device. | Catalogue, product, cart, and checkout are exercised on one Android phone. The sticky buy bar does not cover the pay control. |

### Claim for the people, not the codebase

| Offer | Use |
| --- | --- |
| GitHub Copilot | Editor help while building the shop. Cursor remains the place this repo is edited. Copilot is not a runtime dependency. |
| FrontendMasters | Six months of JavaScript, React, and Node courses for the person shipping the shop. |
| Microsoft 365 | The human mailbox on `rgagro.me` when the farm does not already have one. Brevo sends order mail. Replies to `TRANSACTIONAL_REPLY_TO` need a mailbox a person reads. |

### Leave unclaimed

These offers would add a second host, a second database, or a second payment path.

- Stripe. Razorpay is the payment provider. The existing Stripe files stay until the Razorpay tests cover the same cases, then they go. The pack credit is not a reason to take a live Stripe payment.
- Microsoft Azure, Heroku, Appwrite, GitHub Pages, MongoDB. Neon and Vercel stay.
- Namecheap’s SSL certificate, Name.com, and .TECH. `rgagro.me` is already registered. Vercel issues the certificate.
- Datadog, New Relic, Honeybadger. Sentry is the error tracker.
- ConfigCat and DevCycle. The five commerce flags stay environment variables that refuse to boot in the wrong combination.
- Bootstrap Studio, Themeisle, Icons8, IconScout, Visme. The shop uses the type, colour, and drawings already specified.
- POEditor. The shop is English. The four Hindi pages stay noindex.
- Travis CI, Pageclip. GitHub Actions is CI. Brevo and the existing forms already send and store mail.
- Arduino, Adafruit, CARTO, Camber. They are not part of this shop.

### What to send in chat

Names only. Secrets go into Doppler. The Doppler service token goes into 1Password. A chat message never contains an API key, a DSN, a webhook secret, a database URL, a password, or that Doppler token.

| Service | Send here | Store in Doppler |
| --- | --- | --- |
| 1Password | “Claimed” is enough. | Nothing. The account password stays with the person, and the emergency kit stays offline. |
| Doppler | The project name, and which of `dev`, `preview`, `production`, and `operator` already exist. | Every application secret. The service token stays in 1Password. |
| Sentry | Organization slug, project slug, and the ingest region shown on the project. | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`. |
| Testmail | The namespace. | `TESTMAIL_API_KEY`, in `dev` and `preview` only. |
| Simple Analytics | The hostname added in the dashboard. The expected hostname is `rgagro.me`. | `NEXT_PUBLIC_SIMPLE_ANALYTICS=1` on the configs where the script should load. |
| Codecov | “GitHub App installed on `Battatawada/RamGangaAgro`.” | Nothing when the GitHub App is used. A repository upload token, if one is created, goes in GitHub Actions as `CODECOV_TOKEN`, not in Doppler and not in chat. |
| Imgbot | “Installed on the repo.” | Nothing. |
| BrowserStack | “Claimed.” | `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY`, and only when a device test is automated. |
| GitHub Copilot, FrontendMasters, Microsoft 365 | “Claimed,” and for Microsoft 365 whether a person can read mail at the `rgagro.me` reply-to address. | Nothing. |

### Wired on 27 November 2026

The accounts below exist. Secrets stay in `.env.local` and Doppler. They are not committed.

- 1Password is the vault. The repo has no 1Password token.
- Doppler’s workplace is RG Naturals. The project `ram-ganga-agro` exists there, with `dev`, `stg`, and `prd`. `doppler.yaml` selects `dev`. The CLI is not installed on this machine yet, so the existing secrets have not been uploaded, and the `operator` config is not created yet.
- Sentry organization `rg-naturals`, project `ram-ganga-agro`, ingest region `de`. The SDK is in the app and sends only when `NEXT_PUBLIC_SENTRY_DSN` is set. Error replays run on `/cart` and `/checkout`. The browser sends through the same-origin tunnel. Source-map upload waits for `SENTRY_AUTH_TOKEN`.
- Testmail namespace `mpm97`, student plan. `TESTMAIL_API_KEY` is still only in the Testmail console. `src/lib/testmail.ts` builds `mpm97.{tag}@inbox.testmail.app` and reads the inbox when the key is present.
- Simple Analytics website `rgagro.me` exists. Billing still says the free plan. Connecting GitHub from the student page authorized the app and then landed on the public pricing page, so the one-year Simple plan is not active. The script loads when `NEXT_PUBLIC_SIMPLE_ANALYTICS=1`. It sets no cookie. The privacy page names it. Google Analytics stays off while that flag is set. That flag and `NEXT_PUBLIC_SENTRY_DSN` are set on Vercel for production, preview, and development. The live site uses them on the next deployment.
- Codecov’s GitHub App is installed. CI uploads `coverage/lcov.info` and does not fail the build if the upload is refused. A private-repo upload token, if Codecov asks for one, goes in GitHub Actions as `CODECOV_TOKEN`.
- Imgbot is installed on the repo. It needs no application code.
- BrowserStack current plans: Live for one user, and Automate for one parallel, both on an extended trial. `browserstack.yml` targets a Samsung Galaxy S23 on Android 13. The username and access key stay in the environment.

### Where this sits in the build

Do rows 1–2 before writing new commerce code, so every new key has a vault and a Doppler config. Do rows 3–5 before phase 5, so checkout failures and the guest email are visible while Razorpay is still sandbox. Do rows 6–8 before the launch gate. The personal offers can be claimed at any time.

## Disabled until launch

These stay off in production while the interface is built:

- `STOREFRONT_ENABLED`, `CHECKOUT_ENABLED`, `PAYMENTS_ENABLED`, `ACCOUNTS_ENABLED`, `ADMIN_UI_ENABLED`
- `ALLOW_PRODUCTION_FEATURE_FLAGS`
- Live Razorpay keys. Sandbox keys are allowed in local and preview.
- Public “Add to bag” on the production homepage. The live sentence stays: nothing is for sale yet, until a purchasable variant exists and the flag is turned on deliberately.
- Any order status other than the ones the server sets. A browser return URL is not a payment.

On 27 November 2026, `https://rgagro.me/` was the journal. Shop, cart, and checkout are not in the public nav and were not exercised, because the flags are off. The journey below is tested in development with the flags on, against sandbox payments, before any production flag changes.

## Breakpoints

Measured on the live homepage. No width overflowed. Details and the target behaviour are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Screenshots: [screenshots/breakpoints](screenshots/breakpoints).

| Width | Observed | Interaction to keep |
| --- | --- | --- |
| 360 | Menu button, hero 40px, five lines, drawing below the text | One column. Menu. No horizontal scroll. |
| 390 | Same, hero four lines. Menu opens a full paper screen and locks scroll. Close is a 48px control. | Same menu. Bag joins it only when checkout is on. |
| 430 | Same pattern, more room in the header | Do not reveal the desktop bar. |
| 768 | Menu still present. Hero 61px. | Menu stays. Shop categories are a text row. |
| 1024 | Desktop links. Menu hidden. Hero 76px. Drawing beside the text. Contact fit inside the header. | Two-column product page. Catalogue rows on one line. Sticky bar hides. |
| 1440 | Column 1120px, centred. Hero still 76px. | Do not widen the text. A later photograph may bleed to the edges. |

Each implementation phase ends with screenshots at these six widths for the screens that phase changed. Save them under `docs/redesign/reviews/<phase>/`. Check type size against the scale, 20px or 32px gutters, alignment of the 1120 column, image crops, and that 360 does not scroll sideways.

## Catalogue

The database already has categories `grains`, `dairy`, and `other`, variants with `price_paise`, `weight_grams` or `volume_ml`, and inventory quantity. The page reads that. It does not hard-code three products.

- Group rows by category. Hide a category with no visible products.
- A row links to `/shop/[slug]`.
- Out of stock stays in the list with the words “Sold out” and no add control on the row.
- Three products: three rows, no empty-state illustration, no fake fillers.
- Fifty products: the same row. Category jumps at the top. A category with more than twenty rows gets a sticky heading for that group. Do not paginate until a category passes fifty. Do not virtualise.
- Filters are category only. No “trending”, no price sort in this release, no search on the shop. Site search already exists and does not need to learn prices while the store is dark.

## Product page

Structure, in the current materials:

- Gallery. Real frames when files exist. Otherwise the photo slot or the labelled drawing.
- Name, one-line summary from the database, place (Mamoni, Baran) as a fact already on the site, not a new claim.
- Weight rectangles bound to variants. Changing weight changes the price and the stock line.
- Quantity, clamped to stock.
- Price in rupees from paise, tabular.
- Delivery paragraph from `commercePolicy.shipping`, or the honest gap sentence.
- Ingredients and allergens only when the columns are non-null.
- Link to the crop page when `productSlug` or the crop slug matches.
- Related rows: other purchasable products, omitted when there are none.
- Sticky bar below 1024 with name, price, and Add.
- No rating, no “customers come back”, no certification chip, no per-gram health claim.

Add posts the existing cart action. The server re-reads the price.

## Customer journey

Development only, flags on, sandbox keys.

1. Homepage. With no purchasable variant, the waitlist sentence remains. With one, the primary action is the pack, and the drawing or photograph matches the design-system rule.
2. Catalogue. Open a category, open a sold-out row, open an in-stock row.
3. Product. Switch weight, change quantity, add.
4. Cart. Change quantity, remove a line, confirm the total matches the server, including shipping.
5. Checkout as a guest. Complete the address. Pay in Razorpay’s test mode. Confirm the order stays `pending_payment` until the webhook. Confirm the cart is not cleared before that webhook. Confirm the guest email contains the access link.
6. Cancel the payment. The order stays unpaid. The bag is still there.
7. Sign in with Clerk on a second order. The order appears under the account. A guest order does not appear for a different user.
8. Admin, with a second factor, moves a paid test order to packed. A refund in test mode writes an audit row and does not edit `total_paise` by hand.
9. Repeat the catalogue, product, and checkout at 360 and 390. The sticky bar is reachable and does not cover the pay button.

Production is not part of this script until the launch gate.

## Build order

Each phase leaves production flags false. Screenshot the changed screens at the six widths before the phase is done.

**1. Tokens.** Extend [src/app/globals.css](../../src/app/globals.css) for the row, the weight control, the sticky bar, and tabular prices. No new colour, no new font.

**2. Header and homepage.** [src/components/SiteHeader.tsx](../../src/components/SiteHeader.tsx), [src/components/NavLinks.tsx](../../src/components/NavLinks.tsx), [src/components/MobileMenu.tsx](../../src/components/MobileMenu.tsx), [src/app/page.tsx](../../src/app/page.tsx). Bag only when checkout is on. Hero photograph only when the media kind is image. Waitlist copy stays while nothing is purchasable.

**3. Catalogue and product.** Replace the card list in [src/app/shop/page.tsx](../../src/app/shop/page.tsx) and [src/app/shop/[slug]/page.tsx](../../src/app/shop/[slug]/page.tsx). New pieces under `src/components/shop/`: `ProductRow`, `CategoryJump`, `ProductGallery`, `WeightPicker`, `BuyPanel`, `StickyBuyBar`. Seed nothing. A development fixture may insert three and then fifty rows in a transaction that the test deletes.

**4. Cart.** [src/app/cart/page.tsx](../../src/app/cart/page.tsx). Stop clearing the cookie in `placeOrder` before payment. Show weight, quantity, line total, shipping, and total.

**5. Checkout and Razorpay.** `src/server/payments/razorpay.ts`, webhook `src/app/api/webhooks/razorpay/route.ts`, and the existing order and fulfill path. Signature, amount, currency, idempotency, stock decrement in the paid transaction. Guest token is stored and emailed through Brevo. In development and preview the recipient is a Testmail address, and the test reads that inbox. Sentry is already receiving errors from preview. Stripe files stay until the Razorpay tests cover the same cases. Do not delete them in this phase.

**6. Account and admin.** Account pages show items, address, and status for the signed-in user. `src/app/admin/` calls `requireAdmin()` before any query. Minimum: product, variant, price, stock, order list, packed or shipped, refund through the provider with an audit row. Migration: status check constraint, one inventory row per variant, refund fields.

**7. Policies, schema, and the launch gate.** Shipping, returns, and refunds render the gap sentence until text is supplied. Product JSON-LD only for a purchasable variant with a real price. Then stop. Do not flip production flags in the same change.

## Launch gate

All of these, then a separate change that sets the flags:

- Sandbox journey above, including the failed payment and the duplicate webhook. The guest message is in the Testmail inbox. The failed payment is an event in Sentry.
- At least one pack with a farm photograph, a confirmed price, and stock. Imgbot has run on that photograph.
- Delivery sentence, packer, and grievance details filled with real values. The reply-to address is a mailbox a person reads.
- Privacy page updated for addresses, orders, Brevo, and Simple Analytics, after review. The Google Analytics tag is absent.
- Razorpay activated, webhook secret set, live keys only in the Doppler `production` config and on Vercel. Operator database URLs are absent from Vercel.
- Codecov has reported on the branch that contains checkout.
- Catalogue, product, cart, and checkout have been used on one real Android phone in BrowserStack.
- CA and counsel items either done or explicitly deferred in writing by the farm. A deferral does not allow invented tax or licence numbers.
- Screenshots at the six widths for home, catalogue, product, cart, and checkout, reviewed against [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## What does not change

Authentication rules in [docs/30-authentication-and-admin-path.md](../30-authentication-and-admin-path.md). Rate limits. CSP. The append-only audit log. Server-side totals. No raw card data. Inventory still drops inside the paid transaction, not when the item enters the bag.
