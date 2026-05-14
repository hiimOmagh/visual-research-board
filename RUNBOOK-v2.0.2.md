# v2.0.2 — Dependency Audit Triage

## Apply

Copy `apply-v2.0.2-dependency-audit-triage.py` into the repository root and run:

```bash
python3 apply-v2.0.2-dependency-audit-triage.py
```

The Python applier removes root `apply-v*.mjs` scripts and self-removes if copied into the repo root.

## Triage command

Run:

```bash
npm audit
npm audit --json > artifacts/npm-audit-v2.0.2.json
```

Do not commit local audit JSON unless you explicitly want it as release evidence.

## Validate

```bash
npm run dependency:audit:triage:check
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
npm run dependency:audit:triage:check
```

Run the CI install path before pushing:

```bash
rm -rf node_modules
npm ci
```

Do not run `npm audit fix --force`.

## Cleanup before commit

```bash
rm -rf node_modules .next out dist coverage playwright-report test-results __pycache__
rm -f apply-v*.mjs apply-v*.py
rm -f *.zip *.tar *.tgz *.log
git restore tsconfig.tsbuildinfo 2>/dev/null || true
```

## Commit

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/dependency-audit-triage-check.mjs docs/dependency-audit-triage.md docs/dependency-audit-triage-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: add v2.0.2 dependency audit triage"
```

Do not commit generated/cache files.

## Tag

After CI is green:

```bash
git tag -a v2.0.2 -m "v2.0.2 — Dependency Audit Triage"
git push origin v2.0.2
```
