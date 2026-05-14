# v2.0.3 — Public Demo Evidence + Screenshot Lock

## Apply

Copy `apply-v2.0.3-public-demo-evidence-screenshot-lock.py` into the repository root and run:

```bash
python3 apply-v2.0.3-public-demo-evidence-screenshot-lock.py
```

The Python applier removes root `apply-v*.mjs` scripts and self-removes if copied into the repo root.

## Validate

```bash
npm run public-demo:screenshot:check
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
npm run public-demo:screenshot:check
```

Run CI install path before pushing:

```bash
rm -rf node_modules
npm ci
```

Do not run `npm audit fix --force`.

## Cleanup before commit

PowerShell:

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Bash:

```bash
rm -rf node_modules .next out dist coverage playwright-report test-results __pycache__
rm -f apply-v*.mjs apply-v*.py *.zip *.tar *.tgz *.log
rm -f artifacts/npm-audit-v2.0.2.json artifacts/npm-audit-v2.0.3.json
git restore tsconfig.tsbuildinfo 2>/dev/null || true
```

## Commit

```bash
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/public-demo-screenshot-lock-check.mjs docs/public-demo-evidence-screenshot-lock.md docs/public-demo-screenshot-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: add v2.0.3 public demo screenshot evidence lock"
```

Do not commit generated/cache files or local audit JSON.

## Tag

After CI is green:

```bash
git tag -a v2.0.3 -m "v2.0.3 — Public Demo Evidence + Screenshot Lock"
git push origin v2.0.3
```
