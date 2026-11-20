# Neon backup and recovery (Ram Ganga Agro)

## What was verified in repo

- Production and development Neon endpoints are named in `src/server/db/connection-policy.ts`.
- Development scripts refuse the production endpoint; production runtime refuses the development endpoint.
- Migrations run via `npm run db:migrate:production` with operator credentials (not in git).

## What you should confirm in Neon dashboard

1. **PITR / history retention** for the production branch — note the retention window.
2. **Scheduled snapshots** if enabled on your plan.
3. **Branch restore** — create a child branch from a point in time.

## Suggested restore test (operator)

1. In Neon, create branch `recovery-test-YYYYMMDD` from production at a known timestamp.
2. Point a local `.env` at that branch with `rga_app` (read-only smoke test).
3. Run `npm run messages:read` against the branch if needed (operator script only).
4. Delete the test branch when done.

## What could not be automated from this workspace

- Live Neon project settings without dashboard/API credentials in the agent session.
- A full restore drill on production without your approval.