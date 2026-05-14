# v2.1.2 — First-Run Visual QA + Responsive Screenshot Evidence

## Apply

Copy `apply-v2.1.2-first-run-visual-qa-screenshot-evidence.py` into the repository root and run:

```powershell
python apply-v2.1.2-first-run-visual-qa-screenshot-evidence.py
```

## Validate

```powershell
npm ci
npm run first-run:visual:evidence
npm run first-run:visual:check
npm run first-run:panel:check
npm run first-run:ux:check
npm run release:verify:runner:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

Do not run `npm audit fix --force`.

## Optional screenshot files

Place screenshots here when available:

```text
artifacts/first-run-screenshots/desktop-first-run.png
artifacts/first-run-screenshots/tablet-first-run.png
artifacts/first-run-screenshots/mobile-first-run.png
```

Regenerate the evidence manifest after adding screenshots:

```powershell
npm run first-run:visual:evidence
```

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json,artifacts/npm-audit-v2.0.5.json,artifacts/npm-audit-v2.1.0.json,artifacts/npm-audit-v2.1.1.json,artifacts/npm-audit-v2.1.2.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Keep release evidence artifacts if regenerated:

```text
artifacts/full-qa-gate-report.json
artifacts/release-verify-report.json
artifacts/first-run-visual-evidence.json
```

## Commit

```powershell
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/first-run-visual-evidence.mjs scripts/full-qa-gate.mjs scripts/release-verify.mjs tests/full-qa-gate-check.mjs tests/first-run-visual-qa-check.mjs docs/first-run-visual-qa-screenshot-evidence.md docs/first-run-responsive-screenshot-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json artifacts/release-verify-report.json artifacts/first-run-visual-evidence.json
git commit -m "test: add v2.1.2 first-run visual QA evidence"
```

## Tag

After CI is green:

```powershell
git tag -a v2.1.2 -m "v2.1.2 — First-Run Visual QA + Responsive Screenshot Evidence"
git push origin v2.1.2
```

## Next

`v2.1.3 — First-Run Evidence Artifact Review + Demo Capture Notes`
