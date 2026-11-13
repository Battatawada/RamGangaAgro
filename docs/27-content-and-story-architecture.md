# 27 — Content and story architecture

The public site reads content through one small interface, `ContentSource` in `src/content/source.ts`. Pages and components do not talk to a CMS, and they do not assemble SQL for a crop essay.

## Three layers

| Layer | Lives in | Changes when |
|---|---|---|
| Content | `src/content/story.ts`, `crops.ts`, `journal.ts`, `site.ts` | The farm approves a sentence, a crop, or a note |
| Media | `src/content/media.ts` and `public/illustrations/` | A drawing is replaced by a photograph or a film |
| Presentation | `src/components/story/` and the page layouts | A new kind of section is needed |

A crop page asks `mediaById(crop.mediaId)` and passes the result to `MediaHero`. Replacing the panicle with a field photograph is a change to the media record: `kind`, `src`, `alt`, and `caption`. The grid, the type, and the sections stay.

A future crop is another object in `crops` with the same fields. The homepage and `/grow` list whatever `listCrops()` returns, so a new record appears without a new component. Empty essay slots are `null`. The page shows an honest gap where a section must remain. It does not print “TBD”.

A crop and a product are different. `productSlug` stays `null` until the farm explicitly offers that crop for sale. `purchasable` stays false until then. The story pages do not read the commerce tables.

A journal note is an object in `journalPosts`. `cropSlugs` ties a note to one or more crops. `postsForCrop()` is how a crop page finds them. The body is an array of paragraphs, not HTML. There are no sample posts. `status` on a crop is null when the farm has not named the season.

## Editorial containers

These components are places for words. They are not claims.

| Component | Use |
|---|---|
| `OpeningThought` | The first sentence of a page |
| `FromTheLand` | The land, once the farm will name it |
| `GrowingNow` | What is actually growing |
| `CropChapter` | One part of a crop essay |
| `SeasonalNote` | A short seasonal gap or, later, a real note |
| `FieldObservation` | A quiet aside |
| `JourneyAhead` | The next page, not a promise |
| `JournalEntry` | A published note |
| `WhatComesNext` | A way onward |

Where the farm has not written, the containers may say “The story is still being written.” or “More from the field soon.” Those sentences are gaps. They are not history.

`CopyStatus` on each chapter is `approved`, `draft`, or `placeholder`. Draft holding sentences from the page specifications stay labelled draft in `docs/31-farm-content-approval.md`. Placeholder text is not a farm fact.

## Crop record

Raktshali keeps the safe sentences: the name, “Grown at Ram Ganga Agro”, “Currently growing”, and “It is not for sale.” Wheat is named as grown at the farm. Its season, variety, methods, and availability are null. Natural farming is stated as the farm’s practice. The method, the inputs, and any certificate stay unwritten.

Later fields already exist and are null: `story`, `season`, `fieldMediaId`, `availabilityNote`, plus the essay slots `description`, `facts`, `onThisFarm`, `inTheField`, `harvest`, and `preparation`. A photograph, a season, or a harvest note fills a field. It does not add a route.

Harvest batches, traceability, variants, and prices stay off the public site. The database tables from Phase 1 remain unused by these pages. No `/harvest` route is added.

## Migration path

Stay on the TypeScript modules until there is a real body of notes, crops, or pictures that someone other than a developer needs to edit. That is the whole CMS decision.

When that day comes:

1. Keep `ContentSource` as the only read API the pages use.
2. Implement the same functions in a new adapter, for example `dbContent` or `cmsContent`.
3. Choose the adapter in `src/content/source.ts`. Pages do not import the vendor.
4. Store essays as paragraphs or Markdown without raw HTML, matching the current arrays.
5. Store media as records with `kind`, `src`, `alt`, `caption`, and `credit`. Bytes go to object storage. The page still receives a `MediaAsset`.
6. Keep `CopyStatus`, or an equivalent editorial state, so a draft cannot be treated as an approved fact.
7. Do not couple the presentation components to the CMS’s block format. Map the CMS blocks into `StoryChapter` and `Crop` at the adapter boundary.

The Phase 1 Postgres tables `products` and `media` are shaped for a later move of the public catalogue. They are not a CMS. Do not start writing the live pages from those tables until the editorial workflow exists and the farm has approved the words those rows would show.

Clerk is not the content store. Commerce flags do not gate a story chapter.
