# v2.0.0 — Reference Workflow Stable Release

## Apply

Copy `apply-v2.0.0-reference-workflow-stable-release.py` into the repository root and run:

```bash
python3 apply-v2.0.0-reference-workflow-stable-release.py
```

## Validate

```bash
npm run reference-workflow:stable:check
npm run activation-pack:export:check
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
npm run reference-workflow:stable:check
```

Also run:

```bash
rm -rf node_modules
npm ci
```

Do not run `npm audit fix --force` during this stable release.

## Commit

```bash
rm -f apply-v*.mjs apply-v*.py
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/reference-workflow-stable-release-check.mjs docs/reference-workflow-stable-release.md docs/stable-reference-workflow-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: stabilize v2.0.0 reference workflow release"
```

## Tag after CI is green

```bash
git tag -a v2.0.0 -m "v2.0.0 — Reference Workflow Stable Release"
git push origin v2.0.0
```
