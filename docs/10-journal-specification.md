# 10 — Journal

## `/journal`

**Visitor.** Someone hoping for news, or arriving from a future post.

**h1:** The journal.

Deck, DRAFT: Notes from the farm, when there is a season to record.

**Empty, Phase 1.** The same panel as the homepage: “The journal is just beginning.” One sentence. A link back home. No dates, no author avatars, no “Article”, “Update”, and “Video” tabs with nothing behind them.

**When posts exist.** A list, not a masonry grid. Each `JournalCard` is a row from 768px: media 3/2 at 240px, then eyebrow (the kind: Note, or Film), title in Fraunces, date in clay-deep, and a two-line excerpt. The row links to `/journal/[slug]`. Below 768px, media on top.

Kinds are `note` and `film`. A film card shows a poster and the word Film. It does not autoplay on the index.

Filters, if more than six posts exist someday: All, Notes, Films, as text links that set a query, not a client-only tab that hides content from the URL. Phase 1 does not build filters.

## `/journal/[slug]`

If the slug is not a published post, `notFound()`.

If it is: breadcrumb Journal / title. `h1` is the title. Date. Body in the prose measure. A film embeds only a URL the farm has stored, with a title and a transcript or a note that there is no spoken track. Do not hotlink a random YouTube channel.

Body content is rendered from a constrained format (Markdown without raw HTML). See the security doc. No comments in Phase 1.

## Homepage relationship

Zero posts: the homepage empty panel. One or more: the latest post as one card and “All notes” linking here.

## What a post needs before it can be published

Title, slug, date, kind, body, and alt text if there is an image. Author name only if a person agrees to be named. Otherwise the byline is “Ram Ganga Agro.”
