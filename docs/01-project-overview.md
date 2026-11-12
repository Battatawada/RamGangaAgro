# 01 — Project overview

Ram Ganga Agro is a real farm in India. The public site is its home on the web, at `https://rgagro.me`. The farm grows Raktshali rice and may grow more. It does not sell online yet.

The site should feel like a visit: the land, the crop, the season, and a way to hear when a harvest is ready. A shop can be turned on later without a redesign.

## What is known

- The name is Ram Ganga Agro.
- The domain is rgagro.me.
- The farm grows Raktshali rice. Spelling should be confirmed by the farm before launch.
- The rice is not for sale on this site.
- Photography and video are being planned. They are not in this repository.
- Clerk is the identity provider the business already has.
- The stack for implementation is Next.js App Router, TypeScript, Tailwind, PostgreSQL, Drizzle, Zod, and a shared rate limiter.

## What is not known

Anything not in the list above. In particular: where the fields are, who farms them, when the farm started, how large it is, which practices are used, whether anything is certified, how the rice tastes, how it is cooked here, prices, pack sizes, and delivery.

## Visitor path

Discover the farm, understand that there is land and a crop, read the rice, follow the season, and later, if the flags are turned on, bring a harvest home.

## Phase line

Phase 1 is the public site and the secure foundation. Commerce and admin stay designed and switched off. See `22-phase-1-implementation-plan.md`.
