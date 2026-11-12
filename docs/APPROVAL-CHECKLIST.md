# Approval checklist

Nothing here has been built. Mark each item before Claude starts Phase 1. A “no” means the blueprint changes first.

## Brand

- [ ] Paper `#F4EFE6`, ink `#1C1915`, green `#1C3328`, burgundy `#6E2A32`
- [ ] Grain `#C6A56A` is decorative only
- [ ] Fraunces for headings, Outfit for body and UI
- [ ] Radius 2px, no shadows, no pill buttons
- [ ] Deck: “A farm, its crops, and the journey from the land to the table.”
- [ ] No public use of “red rice” or “traditional” until the farm confirms both
- [ ] Crop card shows the panicle, centred, on the blush panel
- [ ] Every layout change is at 1024px
- [ ] `/unsubscribe` works by email address before any mail is sent, with one identical public response for known, unknown, repeated, differently capitalised, and space-padded addresses
- [ ] Contact messages are read with `rga_messages_reader`, never with the migration role, and only after the audit row has committed. If that commit fails, nothing is shown
- [ ] Panicle drawing as the hero until a real photograph exists
- [ ] Wordmark RAM GANGA AGRO, mark is the small panicle

## Pages

- [ ] Nav: Our Farm, What We Grow, Journal, Contact
- [ ] Homepage section order in `06-homepage-specification.md`
- [ ] Child farm pages ship in Phase 1 as short honest pages
- [ ] One crop, Raktshali, status Currently growing, no price
- [ ] Journal empty state, no sample posts
- [ ] Follow form with an unchecked consent box
- [ ] Privacy and terms before any production email is stored
- [ ] Draft sentences may go live only after the farm reads them

## Facts the farm must still give, or the gaps stay

- [ ] Spelling of the rice
- [ ] A public email, if any
- [ ] Place name, if it may be published
- [ ] Any sentence about people, practices, or the crop beyond the drafts

## Security and scope

- [ ] Clerk Invite-only until accounts are a real launch
- [ ] No Organizations, no Clerk Billing
- [ ] Role only in server-written `publicMetadata`
- [ ] Admin MFA enforced in application code, instance-wide MFA left off
- [ ] Five flags, all false
- [ ] Phase 1 does not include admin UI, cart, checkout, payments, or account pages
- [ ] Strict CSP, accepting request-time rendering
- [ ] Separate roles for migrations, the running app, inbox reading, and erasure
- [ ] The site will not be described as secure because Clerk is installed

## Operations, can wait until deploy but should be known

- [ ] Hosting provider
- [ ] Database provider and region
- [ ] Who the first admin is
- [ ] Who reviews the privacy draft
