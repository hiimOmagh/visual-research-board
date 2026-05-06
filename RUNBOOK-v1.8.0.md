# v1.8.0 — Activation Pack Export Preview

## Apply

Copy `apply-v1.8.0-activation-pack-export-preview.py` into the repository root and run:

```bash
python3 apply-v1.8.0-activation-pack-export-preview.py
```

The Python applier removes root `apply-v*.mjs` scripts and self-removes if copied into the repo root.

## Validate

```bash
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
npm run reference-activation:check
npm run book-reference:check
npm run social-reference:check
npm run broad-discovery:check
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
npm run activation-pack:export-preview:check
```

Also run the CI install path before pushing:

```bash
rm -rf node_modules
npm ci
```

## Commit

```bash
rm -f apply-v*.mjs apply-v*.py
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/activation-pack-export-preview-check.mjs src/types/activation-pack-export-preview.ts src/lib/activation-pack-export-preview.ts src/components/search/ActivationPackExportPreviewPanel.tsx docs/activation-pack-export-preview.md docs/activation-pack-export-preview-boundaries.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "feat: add v1.8.0 activation pack export preview"
```

Do not commit root apply scripts.
