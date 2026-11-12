# 11 — Contact, follow, privacy, terms

## `/contact`

**Visitor.** A person who wants to write to the farm, not to buy.

**h1:** Contact.

Deck, DRAFT: Write to the farm. If you are asking about a harvest, the notes list is the surer way to hear back.

The page is two columns from 1024px. Left: the form. Right: only the details the farm has published. If there is no address, phone, or email, the right column is omitted. Do not invent an inbox.

`ContactForm` fields:

- Name, required, 1–80 characters
- Email, required, valid email, max 254
- Message, required, 10–2000 characters
- Honeypot, visually hidden, label “Company”, must be empty
- No phone field. No dropdown of topics.

Button: Send. Success: the form is replaced by “Your note has been received.” and a link home. Failure: the fields stay, errors sit under the fields, and a live region says “The note was not sent. Check the fields and try again.” A server failure uses the same sentence. It does not show a stack trace.

Rate limit: 5 successful attempts per hour per IP, and 3 per hour per email. Over the limit: “Too many notes from here. Try again later.” HTTP-equivalent status on the action result, not a 500.

The message is stored in `contact_messages`. Phase 1 does not email it, because there may be no mail provider yet. The row holds name, email, message, and `created_at`.

The runtime role may insert a row and may not select from that table. Reading the inbox is a separate role, `rga_messages_reader`, used only by an operator script. The migration role is never used to read messages. The procedure is in doc 19. There is no public page that lists messages, and there is no admin UI in Phase 1.

Privacy link under the form.

## `/follow`

Reached after a valid newsletter submission, and harmless if opened directly. After a real submission the `h1` is “You are on the list.” The body says that nothing will be emailed yet, and that notes will go to that address when the farm starts sending them. A link points to `/unsubscribe`. A direct visit with no submission does not say the visitor joined. It says: “Use the form on the homepage to follow the farm.”

## Unsubscribe — required in Phase 1

The form promises that a person can unsubscribe at any time. Phase 1 does not send email, so the promise cannot depend on a link inside a message that does not exist.

`/unsubscribe` is a public page with one email field and a button, “Remove this address.” The action trims whitespace and lowercases the address before lookup. If a subscriber row exists, it sets `unsubscribed_at`. A second request for an address that is already removed changes nothing and does not say so. The response is always the same sentence, for a known address, an unknown address, a repeat, a different capitalisation, and surrounding spaces: “If this address was on the list, it has been removed.” No timing or wording difference may reveal which of those cases it was. Rate limit: 5 attempts per hour per IP. Over the limit, the page says the form was submitted too often. It still does not say whether the address was listed.

The token hash stays on the row for a later one-click link, once a mail provider exists and a real note can carry `/unsubscribe?token=`. Phase 1 does not email the token, does not show it, and does not require it. Losing the confirmation page must not trap someone on the list.

## Newsletter behaviour

Fields: email, consent checkbox required, honeypot.

Copy of the checkbox: “Send me harvest notes when the farm starts sending them. I can unsubscribe at any time.”

The server stores the email lowercased, `consent_at` as the request time, source `homepage`, and a random unsubscribe token’s hash. It does not send mail. A second signup for an address that is already active does not create a second row and does not reveal that the address was known. The confirmation page is the same. An address with `unsubscribed_at` set may subscribe again, which clears `unsubscribed_at` and sets a new `consent_at` only when the checkbox is checked.

Double opt-in remains a later switch. The column `confirmed_at` stays nullable. Phase 1 is the explicit checkbox plus the working unsubscribe page, not a confirmation email.

Rate limit: 5 per hour per IP.

## `/privacy` and `/terms`

These pages ship in Phase 1 before the forms are enabled. They are prose, 680px.

The implementer drafts them from the data actually collected: name, email, message, consent time, and technical logs that exclude secrets. The draft is marked for legal review. It states how to ask for deletion (the contact form, until a self-serve account exists). It does not claim GDPR or DPDP compliance. It does not paste a generic ecommerce policy about orders, cards, or shipping.

Terms, Phase 1, are short: the site is information from the farm, nothing is offered for sale, and the content is the farm’s. No warranty language copied from a shop template.

## Footer form

The footer links to the homepage follow section. One form, one rate-limit path. `/unsubscribe` is linked from `/follow`, the privacy page, and the footer.
