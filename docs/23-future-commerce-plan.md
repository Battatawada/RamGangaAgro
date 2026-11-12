# 23 — Future commerce

Not Phase 1. The schema in doc 19 is the extension point. Do not build these routes while the flags are false.

## Turning selling on

1. The farm confirms a real pack, a price in paise, and a delivery statement that is true.
2. `STOREFRONT_ENABLED` shows the price on the existing crop page and card. The essay above the price does not change.
3. `CHECKOUT_ENABLED` shows cart and checkout. Guest checkout is allowed: an order may have no `user_id` if it has an email. Access to that order is a signed link, not a guessable id.
4. `PAYMENTS_ENABLED` attaches a provider. The provider is an Indian gateway chosen at that time. It is not Clerk Billing.
5. `ACCOUNTS_ENABLED` opens profile, addresses, and order history. Clerk access mode changes from Invite-only to Open in the same launch, as a conscious Dashboard change. Existing admins keep their metadata.

Checkout cannot boot without the storefront flag. Payments cannot boot without checkout.

## Payment rules

The client sends variant ids and quantities. The server loads `price_paise`, computes the total, and stores it. A return URL does not mark the order paid. The webhook verifies the provider’s signature, checks the amount and currency against the order, and inserts `webhook_events` with provider name and event id. A duplicate event returns success and does not change the order twice.

Card numbers and CVVs are not fields. The database stores a provider reference and a status.

Refunds are an admin action, later, audited, and they call the provider. They are not a database edit of `total_paise`.

COD, if offered, is a provider that sets `pending_collection` and never a paid card status.

## Inventory

Decrement in the same transaction as the transition to paid, with a check that quantity does not go below zero. A failed payment does not decrement.

## Harvest page

`/harvest/[batch]` reads a public harvest by `batch_code`: crop name, date, field label, notes, public media. It does not read orders or customers. It ships when a real code is printed on a real pack.

## Admin, Phase 2

`ADMIN_UI_ENABLED`. Crops, journal, media, harvests, non-secret copy. Every mutation uses `requireAdmin`, allowlisted Zod objects, and an audit row in the same transaction. Role changes go through `updateUserMetadata` and wait for the webhook to move the replica. They do not write `users.role` from the form.

Orders, customers, and refunds are a later phase again, behind the same admin gate.

## Media uploads

When they start: presigned upload after `requireAdmin`, allowlisted types `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `video/mp4`, `video/webm`, magic-byte check, size cap, no SVG from users. Public farm pictures can be public URLs. Anything private uses a short-lived signed URL. The Phase 1 SVGs stay in the repo.
