# RUNBOOK v2.3.0 — Real Creator Session Quality Pass

## Objective

Improve the creator-facing product workflow after v2.2.2 passed full QA and CI parity.

## Scope

- Product-depth workflow polish only.
- No packaging work.
- No release archive gates.
- No OAuth, paid APIs, or live scraping.
- Local-first fixture/demo mode remains explicit.

## Primary validation

```powershell
node -p "require('./package.json').version"
npm run creator-session:quality:review
npm run creator-session:quality:check
npm run creator-workflow:mvp:check
npm run creator-workflow:interaction:check
npm run creator-workflow:usability:check
npm run lint
npm run qa
npm run verify:ci-parity
```

## Expected outcome

The `/creator-workflow` page supports a realistic creator session:
Research Brief → Query Plan Preview → Discovery Results → Review Actions → Saved Board Sections → Coverage Gaps → Evidence Pack Export Preview v2.
