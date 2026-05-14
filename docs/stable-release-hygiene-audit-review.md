
# Stable Release Hygiene + Audit Warning Review — v2.0.3

v2.0.3 is a hygiene-only patch after the v2.0.0 stable release.

## Objective

Confirm the stable release remains clean after validation:

- audit the 2 moderate npm audit warnings without force-fixing
- confirm no generated/cache files are committed
- verify release docs/screenshots guidance
- verify tag/release artifact consistency
- preserve full QA coverage
- no new features
- no dependency churn

## Audit warning policy

The current release treats the 2 moderate npm audit warnings as non-blocking dependency-maintenance work.

Do not run `npm audit fix --force` inside this patch.

Reason: force-fixing may introduce breaking dependency changes and move the release away from stable hygiene into uncontrolled dependency churn.

## Required state

- `npm ci` passes
- `npm run qa` passes
- `npm run stable:hygiene:check` passes
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run build` passes
- `artifacts/full-qa-gate-report.json` exists
- full QA artifact reports `app_version = 2.0.3`
- full QA artifact reports `failed_gate_count = 0`

## Artifact hygiene

Do not commit generated/cache files:

- node_modules
- .next
- dist
- out
- coverage
- tsconfig.tsbuildinfo
- __pycache__
- root apply scripts
- local zip bundles
- local logs

## Tag/release artifact consistency

After CI is green, the release tag should match:

- tag: `v2.0.3`
- package version: `2.0.3`
- full QA artifact: `2.0.3`
- release docs: `v2.0.3`

## Non-goals

- no new features
- no provider expansion
- no export rewrite
- no scraping
- no image generation
- no copyrighted text extraction
- no paywall bypass
- no source media rehosting
