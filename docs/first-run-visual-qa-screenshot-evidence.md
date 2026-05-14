# First-Run Visual QA + Responsive Screenshot Evidence — v2.1.7

v2.1.7 records the visual QA plan for the mounted first-run workflow panel.

## Objective

Create repeatable responsive screenshot evidence for first-run UX.

## responsive screenshot evidence

Expected screenshot set:

- `artifacts/first-run-screenshots/desktop-first-run.png`
- `artifacts/first-run-screenshots/tablet-first-run.png`
- `artifacts/first-run-screenshots/mobile-first-run.png`

Expected generated manifest:

- `artifacts/first-run-visual-evidence.json`

Generate the manifest with:

```bash
npm run first-run:visual:evidence
```

## manual review

The screenshot evidence is a review artifact, not a rights or source verification claim.

Review:

- desktop
- tablet
- mobile

Check:

- first-run panel visible
- primary search action visible
- provider/source controls reachable
- no horizontal overflow
- no clipped text
- activation pack purpose visible or reachable
- export preview purpose visible or reachable
- boundary copy visible or discoverable

## Non-goals

- no dependency churn
- no provider expansion
- no export rewrite
- no scraping
- no image generation
- no paywall bypass
- no source media rehosting
