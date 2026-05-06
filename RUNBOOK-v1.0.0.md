# v1.0.0 — Public Demo Stable Release

## Apply

Copy `apply-v1.0.0-public-demo-stable-release.mjs` into the repository root and run:

```bash
node apply-v1.0.0-public-demo-stable-release.mjs
```

The apply script removes root `apply-v*.mjs` scripts so ESLint does not scan temporary patch files.

## Validate

Run:

```bash
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
npm run public-demo:stable:check
```

If the first `public-demo:stable:check` warns about stale `artifacts/full-qa-gate-report.json`, continue. The final check after `npm run qa` should pass cleanly.

## Commit

```bash
rm -f apply-v*.mjs
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/public-demo-stable-release-check.mjs docs/public-demo-stable-release.md docs/stable-release-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: lock v1.0.0 public demo stable release"
```

Do not commit root apply scripts.
