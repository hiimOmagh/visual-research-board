# v0.9.0 — Public Demo Final Acceptance

## Apply

Copy `apply-v0.9.0-public-demo-final-acceptance.mjs` into the repository root and run:

```bash
node apply-v0.9.0-public-demo-final-acceptance.mjs
```

The apply script self-removes when it runs from the repo root so ESLint does not scan temporary patch files.

## Validate

Run:

```bash
npm run public-demo:final:check
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
npm run public-demo:final:check
```

If the first `public-demo:final:check` warns about stale `artifacts/full-qa-gate-report.json`, run the full chain. The final `public-demo:final:check` after `npm run qa` should pass without artifact warnings.

## Commit

```bash
rm -f apply-v0.9.0*.mjs
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/public-demo-final-acceptance-check.mjs docs/public-demo-final-acceptance.md docs/final-demo-review-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: add v0.9.0 public demo final acceptance"
```

Do not commit root apply scripts.
