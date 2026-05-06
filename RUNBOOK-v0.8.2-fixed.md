# v0.8.2 Public Demo Evidence Lock — Fixed Apply Script

## Apply

Copy `apply-v0.8.2-public-demo-evidence-lock-fixed.mjs` into the repository root and run:

```bash
node apply-v0.8.2-public-demo-evidence-lock-fixed.mjs
```

## Validate

```bash
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

## Commit

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/public-demo-evidence-lock-check.mjs docs/public-demo-evidence-lock.md docs/release-evidence-lock.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: lock v0.8.2 public demo evidence"
```
