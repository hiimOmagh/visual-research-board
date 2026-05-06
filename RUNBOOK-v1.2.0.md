# v1.2.0 — Broad Reference Result Model

## Apply

Copy `apply-v1.2.0-broad-reference-result-model.mjs` into the repository root and run:

```bash
node apply-v1.2.0-broad-reference-result-model.mjs
```

The apply script removes root `apply-v*.mjs` scripts so ESLint does not scan temporary patch files.

## Validate

Run:

```bash
npm run broad-reference:model:check
npm run reference:intelligence:check
npm run public-demo:stable:check
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
npm run broad-reference:model:check
```

If the first `broad-reference:model:check` warns about stale `artifacts/full-qa-gate-report.json`, continue. The final check after `npm run qa` should pass cleanly.

## Commit

```bash
rm -f apply-v*.mjs
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/broad-reference-result-model-check.mjs src/types/broad-reference-result.ts src/lib/broad-reference-result.ts src/components/search/SourceClassBadge.tsx src/components/search/BroadReferenceResultPanel.tsx docs/broad-reference-result-model.md docs/source-class-taxonomy.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "feat: add v1.2.0 broad reference result model"
```

Do not commit root apply scripts.
