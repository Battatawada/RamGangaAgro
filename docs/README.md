# Ram Ganga Agro — handover

This folder is the blueprint. The website has not been built. Security has not been implemented. Phase 1 starts only after the decisions in `APPROVAL-CHECKLIST.md` are accepted.

Claude implements from these documents. Grok prepared them on 12 November 2026 after reading the live reference sites and the current Clerk and Next.js docs.

## Read in this order

1. `01-project-overview.md` — what this is, and what must never be invented.
2. `03-brand-strategy.md` and `04-design-system.md` — the look. Tokens live in `../design/`.
3. `06-homepage-specification.md` and `09-raktshali-rice-specification.md` — the two pages that define the craft. Open `../design/mockups/homepage.html` and `raktshali.html` beside them.
4. `05-information-architecture.md`, then `07` through `11` for the other pages.
5. `16-component-specifications.md` before writing components.
6. `17` through `20` before writing data, Clerk, or forms.
7. `22-phase-1-implementation-plan.md` for the build order.
8. `21-testing-and-acceptance-criteria.md` for done.

`02-reference-research.md` is background. Do not copy those sites.

## Decisions treated as final, pending the checklist

- Quiet paper, deep ink, one burgundy for the rice. Grain is never text on paper.
- Fraunces for headings, Outfit for UI and body. Radius 2px. No drop shadows.
- Public nav: Our Farm, What We Grow, Journal, Contact.
- Crop URL is `/grow/raktshali-rice`, not a shop URL.
- Hero media swaps from illustration to image to video without a redesign.
- One crop card. An honest empty journal. No shop, cart, checkout, account, or admin UI in Phase 1.
- Clerk for identity. Invite-only until customer accounts are a real launch. Role in `publicMetadata` only. No Organizations. No Clerk Billing.
- Five flags, all false: `ACCOUNTS_ENABLED`, `ADMIN_UI_ENABLED`, `STOREFRONT_ENABLED`, `CHECKOUT_ENABLED`, `PAYMENTS_ENABLED`.
- PostgreSQL with Drizzle. Separate roles for migrations, the running app, inbox reading, and erasure. An append-only audit log. Verified, idempotent webhooks.

## Phase 1 includes

The public farm pages, the design system, privacy and terms, contact, the newsletter with consent, the database foundation, Clerk invite-only with a user replica, security utilities, and tests.

## Phase 1 excludes

Admin UI, customer account pages, prices, cart, checkout, payments, order management, and the public harvest QR page.

## Never invent

A founding year, generations, acreage, certifications, organic status, methods, testimonials, press, prices, delivery areas, or a village. If a fact is not in `15-content-and-asset-inventory.md` as supplied, leave the marked gap or omit the sentence.

## How to know it is done

`21-testing-and-acceptance-criteria.md` and the definition of done in `22-phase-1-implementation-plan.md`. A finished Phase 1 is a public site that matches the mockups and refuses every dormant route. It is not a claim that the system is secure. The security tests have to be run and recorded.

## Visual files

`../design/mockups/homepage.html` and `../design/mockups/raktshali.html` are static references. Rebuild them in the app. Do not ship those HTML files as the site.
