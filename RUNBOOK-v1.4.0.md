# v1.4.0 — Social Reference Discovery Layer

## Apply

Copy `apply-v1.4.0-social-reference-discovery-layer.mjs` into the repository root and run:

```bash
node apply-v1.4.0-social-reference-discovery-layer.mjs
```

The apply script removes root `apply-v*.mjs` scripts so ESLint does not scan temporary patch files.

## Validate

Run:

```bash
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
npm run social-reference:check
```

Also validate the CI install path:

```bash
rm -rf node_modules
npm ci
```

If the first `social-reference:check` warns about stale `artifacts/full-qa-gate-report.json`, continue. The final check after `npm run qa` should pass cleanly.

## Commit

```bash
rm -f apply-v*.mjs
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/social-reference-discovery-check.mjs src/types/social-reference.ts src/lib/social-reference-discovery.ts src/components/search/SocialReferenceDiscoveryPanel.tsx docs/social-reference-discovery.md docs/social-reference-safety-boundaries.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "feat: add v1.4.0 social reference discovery layer"
```

Do not commit root apply scripts.
