# v1.3.0 — Broad Web + Image Discovery Expansion

## Apply

Copy `apply-v1.3.0-broad-web-image-discovery-expansion.mjs` into the repository root and run:

```bash
node apply-v1.3.0-broad-web-image-discovery-expansion.mjs
```

The apply script removes root `apply-v*.mjs` scripts so ESLint does not scan temporary patch files.

## Validate

Run:

```bash
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
npm run broad-discovery:check
```

Also validate the CI install path:

```bash
rm -rf node_modules
npm ci
```

If the first `broad-discovery:check` warns about stale `artifacts/full-qa-gate-report.json`, continue. The final check after `npm run qa` should pass cleanly.

## Commit

```bash
rm -f apply-v*.mjs
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/broad-web-image-discovery-check.mjs src/types/broad-discovery.ts src/lib/broad-discovery.ts src/components/search/BroadDiscoveryModePanel.tsx docs/broad-web-image-discovery.md docs/discovery-mode-taxonomy.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "feat: add v1.3.0 broad web image discovery expansion"
```

Do not commit root apply scripts.
