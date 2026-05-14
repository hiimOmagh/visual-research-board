
# Release Package Audit — v2.1.1

v2.1.1 audits release package readiness for the stable v2 workflow.

## Objective

Verify that package metadata, release docs, QA artifact, and tag guidance are internally consistent before tagging.

## Audit scope

- version consistency
- tag consistency
- package metadata
- script coverage
- release docs
- artifact boundaries
- full QA artifact
- generated/cache files
- screenshot evidence checklist
- dependency-audit triage preservation

## Version consistency

Expected release identity:

- app version: `2.1.1`
- release label: `v2.1.1 — Release Package Audit`
- package version: `2.1.1`
- package-lock root version: `2.1.1`
- full QA artifact app version: `2.1.1` after `npm run qa`
- tag: `v2.1.1` after CI is green

## Artifact boundaries

Allowed release evidence:

- `artifacts/full-qa-gate-report.json`

Do not commit local generated/cache files or local audit scratch files.

## Non-goals

- no new features
- no dependency churn
- no provider expansion
- no export rewrite
- no scraping
- no image generation
- no copyrighted text extraction
- no paywall bypass
- no source media rehosting

## Acceptance

The release package is acceptable when `npm ci`, full QA, typecheck, lint, build, the release package audit check, and GitHub Actions all pass.
