# 21 — Testing and acceptance

A passing suite does not mean the site is secure. It means the checks that were written were run. Record the date, the commit, and any failure.

## Automated in Phase 1

Use the test runner the Next.js version recommends. Prefer tests that call the data functions and the actions with a test database, not tests that only render HTML.

1. Public pages return 200: `/`, `/our-farm`, the three children, `/grow`, `/grow/raktshali-rice`, `/journal`, `/contact`, `/follow`, `/unsubscribe`, `/privacy`, `/terms`.
2. `/journal/not-a-real-slug` returns 404.
3. `/shop`, `/cart`, `/checkout`, `/account`, `/admin`, `/harvest/demo` return 404 and do not query orders.
4. Homepage HTML contains the hero line, “Currently growing”, and “It is not for sale.” It does not contain “Add to cart”, “₹”, “Shop now”, “red rice”, or “traditional”.
5. Contact action rejects an empty message, a missing email, an overlong message, and a filled honeypot.
6. Newsletter action rejects a missing checkbox and a filled honeypot.
7. Unsubscribe returns one identical sentence, and no other distinguishing detail, for: an address on the list, an address never stored, a second request for an address already removed, the same address with different capitalisation, and the same address with leading or trailing spaces. A listed address ends with `unsubscribed_at` set. The stored email is the trimmed, lowercased form.
8. The sixth contact submission from the same IP in an hour is refused. Use a fake clock or a limiter that accepts a test store.
9. Webhook with a bad signature writes no user and returns 400.
10. The same valid event id twice inserts one user.
11. A payload whose `unsafe_metadata.role` is `admin` and whose `public_metadata` is empty creates a `customer`.
12. `public_metadata.role` of `admin` on a verified event stores `admin`.
13. `requireAdmin` refuses a missing session, a customer claim, and a session whose second-factor age is `-1`, even if the role claim is `admin`.
14. The built client assets do not contain `sk_live`, `sk_test`, `DATABASE_URL`, or `WHSEC_`.
15. `npm audit` at high severity fails CI, with an allowlist file that must name the advisory and the review date if something is temporarily accepted.
16. The grants SQL shows `rga_app` without SELECT on `contact_messages`, and `rga_messages_reader` with only SELECT on `contact_messages` and INSERT on `audit_log`. It does not GRANT `rga_migrator` that SELECT. The migrator owns the table. On PostgreSQL 18.7 on the Neon development branch, that `REVOKE` was enforced against the owner login. Older PostgreSQL releases let owners bypass it, so the login remains a trusted operator account and is not an application credential.
17. The reader script prints no message when the audit insert or its commit fails. A successful run has a committed audit row before the first message line is produced.

## Manual before calling Phase 1 done

- Keyboard only: skip link, the mobile menu (open, trap, Escape, focus return), both forms, and unsubscribe.
- 360px and 1280px against the mockups.
- Reduced motion: menu still works, no essential content waits on an animation.
- Screen reader spot check on the hero and the contact errors.
- Invite-only: a signed-out visit to `/sign-up` does not create a user without an invitation. This needs the real Clerk development instance.
- Privacy page is linked from the form and describes the fields actually stored.

## Not in Phase 1, specified so they are not dropped

When orders exist: customer A cannot read customer B’s order by changing the id. When payments exist: a return URL does not mark an order paid, a duplicate payment event does not double-apply, a client-supplied total is ignored. When admin UI exists: a customer session receives 404 on `/admin` and 403 or a generic refusal on the action, and a role change writes an audit row.

## Acceptance of the design

A person who has not seen the research can open the mockups and the built pages and match section order, type, colour, and the absence of a shop. Copy that the farm has not approved stays in a content file as draft and is listed in the release notes.
