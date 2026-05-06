# v0.8.3 — Hosted Demo Evidence Review

## Apply

Copy `apply-v0.8.3-hosted-demo-evidence-review.mjs` into the repository root and run:

```bash
node apply-v0.8.3-hosted-demo-evidence-review.mjs
```

## Validate

Run:

```bash
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

If `hosted-demo:evidence:check` fails before `npm run qa`, run `npm run qa` once to regenerate `artifacts/full-qa-gate-report.json`, then rerun the hosted-demo check.

## Commit

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/hosted-demo-evidence-review-check.mjs docs/hosted-demo-evidence-review.md docs/hosted-demo-review-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: add v0.8.3 hosted demo evidence review"
```

Do not commit root apply scripts.
