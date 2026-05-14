# v2.1.1 — Controlled First-Run Panel Mount + UI Consistency

## Apply

Copy `apply-v2.1.1-controlled-first-run-panel-mount.py` into the repository root and run:

```powershell
python apply-v2.1.1-controlled-first-run-panel-mount.py
```

## Validate

```powershell
npm ci
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

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json,artifacts/npm-audit-v2.0.5.json,artifacts/npm-audit-v2.1.0.json,artifacts/npm-audit-v2.1.1.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Keep release evidence artifacts if regenerated:

```text
artifacts/full-qa-gate-report.json
artifacts/release-verify-report.json
```

## Commit

```powershell
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md src/components/search/SearchPanel.tsx src/components/search/FirstRunWorkflowPanel.tsx scripts/full-qa-gate.mjs scripts/release-verify.mjs tests/full-qa-gate-check.mjs tests/first-run-panel-mount-check.mjs docs/controlled-first-run-panel-mount.md docs/ui-consistency-first-run-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json artifacts/release-verify-report.json
git commit -m "feat: mount v2.1.1 first-run workflow panel"
```

## Tag

After CI is green:

```powershell
git tag -a v2.1.1 -m "v2.1.1 — Controlled First-Run Panel Mount + UI Consistency"
git push origin v2.1.1
```

## Next

`v2.1.2 — First-Run Visual QA + Responsive Screenshot Evidence`
