# 33 — Rate limiting

The public contact, newsletter, and unsubscribe forms refuse to write unless a shared store accepts the request. An empty configuration does not mean “no limit”. It means the write fails.

This is not a claim that the site is secure. It records the store, the keys, and what was tested.

## Providers

`RATE_LIMIT_PROVIDER` selects the store.

| Value | Store | When |
|---|---|---|
| `postgres` | `rate_limit_buckets` through `DATABASE_URL`, the `rga_app` login | Development now. Production once that database exists. |
| `upstash` | Upstash Redis REST, atomic `INCR` plus `EXPIRE` in one script | Optional. No account has been created. |
| empty | In-memory counter only when `NODE_ENV` is `test` | Unit tests. |
| `memory`, or any other name | Refused | Everywhere. |

Postgres does not read `DATABASE_URL_MIGRATE`, `DATABASE_URL_MESSAGES`, `DATABASE_URL_PRIVACY`, or a separate rate-limit URL. The running app cannot be pointed at an operator login by adding a new variable.

Upstash is configured with `RATE_LIMIT_REDIS_URL` and `RATE_LIMIT_TOKEN`. The URL must be `https`, with no user, password, query, or hash, and it must not contain the token. The token is never logged. `@upstash/ratelimit` is not used: its default timeout of five seconds returns success when Redis is slow, which would disable the limit. A Redis error throws, and the form refuses the write.

`npm run check:rate-limit` prints the decision and not the secrets. `--production` checks the same variables as a production process and fails if the database URL is still the development branch.

## Allowances

Each operation has its own buckets. Using up contact does not block unsubscribe.

| Operation | Per address | Across all addresses | Window |
|---|---|---|---|
| Contact | 5 | 30 | 1 hour |
| Newsletter | 5 | 30 | 1 hour |
| Unsubscribe | 8 | 40 | 1 hour |

The window is fixed. The first accepted write starts it. The per-address check runs first, so an address that is already blocked does not also consume the global allowance.

Unsubscribe is a little higher because a shared network should still be able to leave the list. The success sentence is unchanged: a listed address and an unknown address get the same words. A missing store, or a store that throws, returns “This form was submitted too often. Try again later.” for every address and does not delete a row.

Contact and newsletter return their ordinary failure sentence when the store is missing or throws. They do not say the note was received.

## Keys

A key looks like `contact:ip:203.0.113.10` or `contact:all`.

The email address is not a key. A value that is not an IP address, including an email address, becomes the single subject `untrusted`, so a caller cannot mint a fresh allowance by changing a string. The key grammar rejects `@` before any store is touched.

`local` is the subject for `RATE_LIMIT_IP_SOURCE=direct`. Every local browser request shares it. That is acceptable on a machine that is not on the public internet. It is refused when `NODE_ENV` is production.

## Client address

| `RATE_LIMIT_IP_SOURCE` | Header that is trusted | Refused value |
|---|---|---|
| `vercel` | Left-most `x-vercel-forwarded-for`. Vercel overwrites this header. `x-forwarded-for` is ignored. | Missing or not an IP → `untrusted` |
| `trusted-proxy` | Left-most `x-forwarded-for` | Use this only when the proxy **replaces** the header. If it appends, the caller can still choose the left-most address. |
| `direct` | None | Development only. |

An IPv4 address with a port is accepted. IPv6 is lower-cased. Anything else shares `untrusted`.

On Vercel, set `RATE_LIMIT_IP_SOURCE=vercel`. On another host, the reverse proxy must overwrite `X-Forwarded-For` with the connection’s address and the variable must be `trusted-proxy`. Do not trust a header the browser can set.

## Failure

- No provider outside tests: the form fails. Pages still render.
- Postgres or Redis error: the form fails. The error text does not include the URL, the token, or the visitor’s email.
- Production with `direct`, or with no address source: `getClientIp()` throws and the form fails.
- The in-memory counter is never selected by an environment variable.

A global allowance can be exhausted by a distributed flood, which pauses that one form for up to an hour. The rest of the site keeps rendering. That pause is intentional.

## What was run

On 13 November 2026, against the Neon development branch only:

- `npm run db:migrate` applied `0001_rate_limit_buckets`. The migrator does not have database `CREATE`, so the script does not run `CREATE SCHEMA`. The existing `drizzle` schema was used.
- `npm run db:grants` re-applied sections 2 to 5, including the new table.
- `npm run test:forms` wrote a contact note, proved `rga_app` cannot select it, subscribed an address, unsubscribed it, and showed the same sentence for an address that was never stored. A sixth contact from one address was refused while a newsletter from that same address was accepted. No bucket key contained `@`.
- The same three forms were submitted in a browser at `http://localhost:3000` with `RATE_LIMIT_PROVIDER=postgres` and `RATE_LIMIT_IP_SOURCE=direct`. Contact showed “Your note has been received.” Newsletter redirected to “You are on the list.” Unsubscribe showed “If this address was on the list, it has been removed.” The development rows were then erased and an audit row was written.

Unit tests cover configuration refusal, spoofed forwarded headers, the email-free keys, the separate allowances, and a Postgres limiter that does not query an unsafe key.

## Production, still to do

Do not point production at the development database or the development Upstash project. There is no Upstash project.

When the production database exists:

1. Create `drizzle` as a superuser, owned by `rga_migrator`, without leaving database `CREATE` on that login.
2. Change `scripts/development-branch.ts` so the production migration is an explicit allowlist entry, not an open connection. Until that change, `npm run db:migrate` refuses every host except the development endpoint.
3. Migrate, re-apply grants, and set `DATABASE_URL` to the production `rga_app` login.
4. Set `RATE_LIMIT_PROVIDER=postgres` and `RATE_LIMIT_IP_SOURCE=vercel` (or `trusted-proxy` if the host is not Vercel).
5. Run `npm run check:rate-limit -- --production` in that environment.
6. Submit one contact, one newsletter, and one unsubscribe on the production host, then erase the contact note with `npm run contact:erase`.

To use Upstash instead, create the database there only after it is approved, put the new URL and token in the production environment, and set `RATE_LIMIT_PROVIDER=upstash`. Do not copy a development token into production.
