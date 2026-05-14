# v2.0.4 — Release Package Audit

## Apply

Copy `apply-v2.0.4-release-package-audit.py` into the repository root and run:

```powershell
python apply-v2.0.4-release-package-audit.py
```

## Validate

```powershell
npm run release:package:audit:check
npm run public-demo:screenshot:check
npm run dependency:audit:triage:check
npm run stable:hygiene:check
npm run reference-workflow:stable:check
npm run activation-pack:export:check
npm run activation-pack:export-preview:check
npm run activation-pack:ui:check
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
npm run release:package:audit:check
```

Run CI install path before pushing:

```powershell
rm -r -fo node_modules -ErrorAction SilentlyContinue
npm ci
```

Do not run `npm audit fix --force`.

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

## Commit

```powershell
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/release-package-audit-check.mjs docs/release-package-audit.md docs/release-package-audit-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json
git commit -m "chore: add v2.0.4 release package audit"
```

## Tag

After CI is green:

```powershell
git tag -a v2.0.4 -m "v2.0.4 — Release Package Audit"
git push origin v2.0.4
```

## Next

`v2.1.0 — First-Run UX + Workflow Clarity`
