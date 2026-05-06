# v0.8.1 — Release Warning Cleanup Runbook

## Scope

Warning-only cleanup after v0.8.1 Public Demo Release Candidate.

## Apply

Copy `apply-v0.8.1-release-warning-cleanup.mjs` into the repository root, then run:

```bash
node apply-v0.8.1-release-warning-cleanup.mjs
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
git add package.json package-lock.json .github/workflows/ci.yml PATCH_MANIFEST.md docs/validation-report.md src/lib/attribution-generator.ts src/lib/evidence-pack-export.ts src/lib/export.ts tests/release-warning-cleanup-check.mjs
git commit -m "chore: clean up v0.8.1 release warnings"
```

## Non-goals

- No provider changes
- No retrieval changes
- No public-demo behavior changes
- No security/key-handling behavior changes
