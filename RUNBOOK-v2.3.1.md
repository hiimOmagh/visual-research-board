# RUNBOOK v2.4.0 — Route Surface Integrity + Creator Workflow Landing Integration

## Objective

Restore and protect the expected Visual Research Board route surface while integrating the creator workflow into the landing path.

## Protected route surface

- `/`
- `/creator-workflow`
- `/api/search`
- `/api/export`
- `/api/metadata`
- `/api/provider-runtime`

## Validation order

```powershell
node -p "require('./package.json').version"
npm run route-surface:review
npm run route-surface:check
npm run creator-session:quality:check
npm run creator-workflow:mvp:check
npm run creator-workflow:interaction:check
npm run creator-workflow:usability:check
npm run lint
npm run qa
npm run typecheck
npm run verify:ci-parity
```

## Non-goals

- No packaging work.
- No release archive gate.
- No OAuth.
- No paid API requirement.
- No live scraping.

## Acceptance

`npm run qa` and `npm run verify:ci-parity` must remain green, and the build route surface must not silently collapse to `/creator-workflow` only.

## Route surface token fix

The landing page must expose `fixture/demo mode`, and the route review script must expose `local-first`.
