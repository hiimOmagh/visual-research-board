# First-Run Evidence Artifact Review + Demo Capture Notes — v2.1.7

v2.1.7 adds an evidence artifact review layer for first-run UX validation.

## Objective

Collect the first-run release evidence into one reviewable artifact:

```text
artifacts/first-run-evidence-review.json
```

Generate it with:

```bash
npm run first-run:evidence-review
```

## evidence artifact review

The review artifact references:

- `artifacts/full-qa-gate-report.json`
- `artifacts/release-verify-report.json`
- `artifacts/first-run-visual-evidence.json`
- `artifacts/first-run-screenshots/desktop-first-run.png`
- `artifacts/first-run-screenshots/tablet-first-run.png`
- `artifacts/first-run-screenshots/mobile-first-run.png`

## manual review

The review artifact records status and expected files. It does not replace human visual inspection.

Required manual checks:

- first-run panel visible
- primary search action visible
- source/provider controls reachable
- no horizontal overflow
- no clipped text
- activation pack and export preview purpose clear
- limitations and boundaries visible or discoverable

## Boundaries

- no rights clearance
- no private account scraping
- no paywall bypass
- no source media rehosting
- no claim that every result is verified
