# v0.8.2 Lint/CI Hotfix Runbook

This hotfix is for a partially applied v0.8.2 warning-cleanup patch.

## Fixes

- Removes `ResearchClaim` from `src/lib/evidence-pack-export.ts` imports.
- Marks or suppresses the intentional `_result` placeholder in `src/lib/attribution-generator.ts`.
- Keeps the previously removed `src/lib/export.ts` warnings clean.
- Updates `.github/workflows/ci.yml` action majors and `node-version`:
  - `actions/checkout@v5`
  - `actions/setup-node@v6`
  - `actions/upload-artifact@v7`
  - `node-version: 24`
- Updates `tests/release-warning-cleanup-check.mjs` to accept the targeted placeholder suppression if the source shape cannot be safely rewritten with `void _result;`.

## Apply

```bash
node apply-v0.8.2-lint-ci-hotfix.mjs
```

## Validate

```bash
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
git add package.json package-lock.json .github/workflows/ci.yml PATCH_MANIFEST.md docs/release-checklist.md docs/validation-report.md src/lib/attribution-generator.ts src/lib/evidence-pack-export.ts src/lib/export.ts tests/release-warning-cleanup-check.mjs
git commit -m "fix: complete v0.8.2 release warning cleanup"
```
