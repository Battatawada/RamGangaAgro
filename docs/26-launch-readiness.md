# 26 — Launch readiness

Date: 13 November 2026. This is a go / no-go list. A box is checked only when the evidence under it exists. The app is on a temporary Vercel URL. `rgagro.me` was not pointed at a host.

**Status: Not ready.**

The public story can run on the temporary production deployment. DNS, the production webhook, the backup drill, and the farm’s approval of the draft pages are still open. Do not describe the site as launched or as secure.

## Application

- [x] Production build passes
- [x] Tests pass
- [ ] Security review completed
- [x] Outstanding dependency advisories reviewed

Evidence, 13 November 2026, on this working tree:

- `npm run build` completed. Next.js 16.4.6. The route list has the public pages and the webhook. It does not have shop, cart, checkout, account, or admin.
- `npm test`: 13 files, 82 tests. `npm run test:e2e`: 31 route tests. `npm run scan:client`: “Client bundle scan clean.”
- `npm run audit:policy`: satisfied. High and critical advisories: none. The eleven moderate advisories are recorded in `32-dependency-security-review.md` and were not waived.
- The Phase 1 review in `25-phase-1-integration-verification.md` and the rate-limit notes in `33-rate-limiting.md` exist. A review of the production host, after it exists, does not. That is why “Security review completed” stays open.

## Forms

- [ ] Production rate limiting configured
- [x] Contact write tested
- [x] Newsletter write tested
- [x] Unsubscribe tested
- [x] Abuse behavior tested

Evidence:

- Development uses `RATE_LIMIT_PROVIDER=postgres` on the development `rga_app` login and `RATE_LIMIT_IP_SOURCE=direct`. `npm run check:rate-limit` accepts that and reports that production is not configured.
- `npm run test:forms` stored a contact note on the development branch, proved `rga_app` cannot select it, subscribed an address, and unsubscribed it. An unknown address received the same sentence and was not inserted.
- The same three forms were submitted in a browser at `http://localhost:3000`. Contact showed “Your note has been received.” Newsletter reached “You are on the list.” Unsubscribe showed “If this address was on the list, it has been removed.” Those rows were then erased.
- A sixth contact from one address was refused while a newsletter from that address was still accepted. Unit tests refuse a spoofed `x-forwarded-for` when the source is `vercel`, collapse a non-address onto one shared bucket, and keep email addresses out of the keys.
- Production still needs `RATE_LIMIT_IP_SOURCE=vercel` or `trusted-proxy`, on the production database or a separately approved Upstash project. That box stays open.

## Content

- [ ] Farm copy approved
- [ ] Crop claims approved
- [ ] Privacy policy approved
- [ ] Terms approved
- [ ] Contact details approved

`31-farm-content-approval.md` is the list. The crop name, “Grown at Ram Ganga Agro”, “Currently growing”, and “It is not for sale” are the safe public set. The rest of the farm pages are drafts or placeholders. Privacy and terms say they are drafts. No public email, phone, or place is printed. These boxes stay open until the farm says otherwise.

## Authentication

- [ ] Production Clerk configured
- [ ] Production redirect URLs configured
- [ ] Admin security verified

The development instance was verified in `25`, including live role revocation and the second-factor gate. Production Clerk does not exist. `30-authentication-and-admin-path.md` is the path. Admin security for production stays open.

## Database

- [ ] Production database configured
- [ ] Restricted roles created
- [ ] Production migrations tested
- [ ] Production connection permissions verified
- [ ] Backup configured
- [ ] Restore drill completed

The development branch has the four roles, the new `rate_limit_buckets` table, and the grants. That is not a production database. No restore drill has been run. `29-production-architecture.md` is the decision, not a completed setup.

## Deployment

- [x] Hosting configured
- [x] Environment variables configured
- [ ] DNS configured
- [x] HTTPS verified
- [x] Security headers verified
- [ ] Production webhook tested
- [ ] Monitoring configured
- [ ] Rollback plan tested

Evidence, 13 November 2026:

- Project `ram-ganga-agro`, deployment `dpl_9Xfycgwt1DpxGHAWgWYowehrgf36`, region `sin1`, target production. Alias `https://ram-ganga-agro.vercel.app`. `rgagro.me` is not attached.
- Production environment only: the public Clerk key is `pk_live`, the secret and `DATABASE_URL` are sensitive, rate limiting is `postgres` / `vercel`, the five flags are false, and `SITE_URL` is `https://rgagro.me`. Preview has none of these. No webhook secret, owner login, or operator URL is on Vercel.
- Public HTTPS returned 200 for the public pages, 404 for an unknown path, `/shop`, and an unknown crop. Responses sent HSTS, `nosniff`, a strict Clerk CSP with a nonce, and `X-Robots-Tag: noindex` because the host is not `rgagro.me`. Canonical URLs are `https://rgagro.me`.
- A contact note, a newsletter row, and an unsubscribe were exercised on that deployment, then removed with the production privacy login. `rga_app` was refused `SELECT` on `contact_messages` (`42501`).
- DNS, the production webhook, monitoring, and a rollback drill are still open. Search Console steps are in `34-search-engines.md`. Nothing has been submitted.

## Before anyone calls it a launch

1. The farm works through `31-farm-content-approval.md`, including privacy and terms.
2. The production project, Clerk instance, and database are created as in `29`, with new secrets.
3. The empty boxes above are checked only after the named command or drill has been run on that production setup.
