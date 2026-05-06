# v2.0.1 — Stable Release Hygiene + Audit Warning Review

## Apply

Copy `apply-v2.0.1-stable-release-hygiene-audit-warning-review.py` into the repository root and run:

```bash
python3 apply-v2.0.1-stable-release-hygiene-audit-warning-review.py
```

The Python applier removes root `apply-v*.mjs` scripts and self-removes if copied into the repo root.

## Cleanup before validation

The hygiene check intentionally fails when generated/cache files exist in the repo root. Clean them first:

```bash
rm -rf node_modules .next out dist coverage playwright-report test-results __pycache__
rm -f apply-v*.mjs apply-v*.py
rm -f *.zip *.tar *.tgz *.log
git restore tsconfig.tsbuildinfo 2>/dev/null || true
```

## Validate

```bash
npm run stable:hygiene:check
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
npm run stable:hygiene:check
```

Run the CI install path before pushing:

```bash
rm -rf node_modules
npm ci
```

Do not run `npm audit fix --force` during this release.

## Commit

After validation, clean generated/cache files again because `npm ci` and build recreate them:

```bash
rm -rf node_modules .next out dist coverage playwright-report test-results __pycache__
rm -f apply-v*.mjs apply-v*.py
rm -f *.zip *.tar *.tgz *.log
git restore tsconfig.tsbuildinfo 2>/dev/null || true
```

Then commit:

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/stable-release-hygiene-check.mjs docs/stable-release-hygiene-audit-review.md docs/audit-warning-review.md docs/release-artifact-hygiene.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: add v2.0.1 stable release hygiene review"
```

Do not commit generated/cache files.

## Tag

After CI is green:

```bash
git tag -a v2.0.1 -m "v2.0.1 — Stable Release Hygiene + Audit Warning Review"
git push origin v2.0.1
```
