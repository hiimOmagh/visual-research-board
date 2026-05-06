# v1.1.0 — Reference Intelligence Layer MVP

## Apply

Copy `apply-v1.1.0-reference-intelligence-layer-mvp.mjs` into the repository root and run:

```bash
node apply-v1.1.0-reference-intelligence-layer-mvp.mjs
```

The apply script removes root `apply-v*.mjs` scripts so ESLint does not scan temporary patch files.

## Validate

Run:

```bash
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
npm run reference:intelligence:check
```

If the first `reference:intelligence:check` warns about stale `artifacts/full-qa-gate-report.json`, continue. The final check after `npm run qa` should pass cleanly.

## Commit

```bash
rm -f apply-v*.mjs
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/reference-intelligence-check.mjs src/types/reference-intelligence.ts src/lib/reference-intelligence.ts src/components/search/ReferenceIntelligencePanel.tsx docs/reference-intelligence-layer.md docs/reference-intelligence-workflow.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "feat: add v1.1.0 reference intelligence layer MVP"
```

Do not commit root apply scripts.
