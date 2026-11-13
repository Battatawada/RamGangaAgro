# 32 — Dependency security review

Date: 13 November 2026.

Command: `npm audit` after the rate-limit work, with no allowlist entries. `security/audit-allowlist.json` is still empty. Nothing here was waived to make the report look clean.

Result: 11 moderate, 0 high, 0 critical.

`npm ls esbuild minimatch drizzle-kit typescript-eslint --omit=dev` is empty. None of these packages are dependencies of the running site.

## Resolved

No published advisory was closed by an upgrade. A compatible fixed release does not exist for either group below.

`@upstash/ratelimit` was removed. It was not imported, and its default timeout of five seconds returns success when Redis is slow. That removal is hygiene. It was not one of the 11 advisories.

## Not applicable to runtime

All 11 are dev-toolchain findings. They are not in the Next.js production server and not in the client bundle.

### esbuild, through drizzle-kit — 4 advisories

[GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99). esbuild’s development server, at versions `<= 0.24.2`, can be asked by another website to read a response.

The chain is `esbuild` → `@esbuild-kit/core-utils` → `@esbuild-kit/esm-loader` → `drizzle-kit`. `drizzle-kit` is a devDependency used to generate SQL. The current release, 0.31.11, also depends on a newer esbuild (`^0.25.4`) directly. The advisory is the older copy nested inside `@esbuild-kit`, which drizzle-kit still uses to load its config. Visitors to the site do not run that process.

### minimatch, through typescript-eslint — 7 advisories

[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). minimatch `7.0.0` through `11.0.0` can be made to do too much work on a hostile glob.

The chain ends at `typescript-eslint`, pulled in by `eslint-config-next` for `npm run lint`. The vulnerable range of `typescript-eslint` is `<= 8.72.2`, and 8.72.2 is the current release. The linter is not on the request path.

## Mitigated

No additional control was added for these two advisories. They are already outside the production process. The public rate limiter does not use the package whose timeout fails open.

## Still outstanding

| Advisory | Packages | Why it remains |
|---|---|---|
| GHSA-67mh-4wv8-2f99 | esbuild, `@esbuild-kit/core-utils`, `@esbuild-kit/esm-loader`, drizzle-kit | `npm audit fix` does not move them. `npm audit fix --force` would install drizzle-kit 0.18.1, which is an older major and would drop the migration tooling this repo uses. The latest drizzle-kit, 0.31.11, still depends on `@esbuild-kit/esm-loader`. |
| GHSA-g3hv-75wg-m249 | minimatch and the `@typescript-eslint/*` packages through 8.72.2, plus `typescript-eslint` | A non-breaking `npm audit fix` leaves the finding in place. The newest `typescript-eslint` is still inside the vulnerable range. |

Re-check both when drizzle-kit drops `@esbuild-kit` and when `typescript-eslint` publishes past 8.72.2. Do not downgrade drizzle-kit to silence the report.
