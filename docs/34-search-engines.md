# 34 — Search engines, after the domain is live

Nothing in this file has been submitted to a search engine. The temporary Vercel URL is not the website. Do not add it as a Search Console property, and do not submit its sitemap.

The canonical origin is `https://rgagro.me`. Titles, descriptions, the sitemap, and `robots.txt` use that origin even while the domain is not connected. A request whose host is not `rgagro.me` answers `X-Robots-Tag: noindex, nofollow`. `www.rgagro.me` redirects to the apex. Preview builds (`VERCEL_ENV=preview` or `development`) disallow every path in `robots.txt`.

## When `rgagro.me` is serving this project

Do these in order. Check a box only after the named page shows the result.

1. Confirm `https://rgagro.me` returns the production deployment over HTTPS, and that `https://www.rgagro.me` redirects to the apex with 308.
2. Confirm a page on `https://rgagro.me` does not send `noindex`, and that the `*.vercel.app` hostname for the same deployment still does.
3. In Google Search Console, add the domain property `rgagro.me` or the URL-prefix property `https://rgagro.me`. Verify it with the DNS record Search Console shows. Do not verify the Vercel hostname instead.
4. Submit `https://rgagro.me/sitemap.xml`.
5. Use URL inspection on `/`, `/our-farm`, `/our-farm/practices`, `/grow`, `/grow/raktshali-rice`, and `/grow/wheat`. Request indexing only after each URL is the canonical one and returns 200.
6. Watch Pages and the crawl-error report for about two weeks. A 404 for a dormant path (`/shop`, `/cart`, `/account`) is expected. A 404 for a URL in the sitemap is not.
7. Read Core Web Vitals in Search Console after field data exists. A Lighthouse run on the temporary URL is not field data. Do not invent numbers.
8. Optionally repeat the sitemap submission in Bing Webmaster Tools for the same apex property.

## What the site is allowed to rank for

The pages describe Ram Ganga Agro, natural farming as the confirmed practice, Raktshali, wheat, and the journal. They do not claim a place, a size, a founding year, a certificate, or a sale. Publishing this does not make the site rank first. Rankings are not under the site's control, and no indexing has been claimed.

## Left for the farm

The story, the land, and most of the journal are still gaps. Those pages can be rewritten when the farm supplies the words. Do not fill them in order to chase a query.
