# v2.1.6 — CI Parity Workflow Badge + Verification Docs Lock

## Apply

Copy `apply-v2.1.6-ci-parity-workflow-badge.py` into the repository root and run:

```powershell
python apply-v2.1.6-ci-parity-workflow-badge.py
```

## Validate

```powershell
npm run ci-parity:workflow:check
npm run verify:all
npm run qa
npm run verify:all
```

Optional clean install parity:

```powershell
npm run verify:ci-parity
```

Do not run `npm audit fix --force`.

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json,artifacts/npm-audit-v2.0.5.json,artifacts/npm-audit-v2.1.0.json,artifacts/npm-audit-v2.1.1.json,artifacts/npm-audit-v2.1.2.json,artifacts/npm-audit-v2.1.3.json,artifacts/npm-audit-v2.1.4.json,artifacts/npm-audit-v2.1.5.json,artifacts/npm-audit-v2.1.6.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Keep evidence artifacts.

## Commit

```powershell
git status --short
git add .github/workflows/ci-parity.yml package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs scripts/release-verify.mjs tests/full-qa-gate-check.mjs tests/release-verify-runner-check.mjs tests/ci-parity-workflow-badge-check.mjs docs/ci-parity-workflow-badge.md docs/verification-docs-lock.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json artifacts/release-verify-report.json artifacts/first-run-visual-evidence.json artifacts/first-run-evidence-review.json artifacts/first-run-demo-script.json
git commit -m "ci: add v2.1.6 ci parity verification lock"
```

## Tag

```powershell
git tag -a v2.1.6 -m "v2.1.6 — CI Parity Workflow Badge + Verification Docs Lock"
git push origin v2.1.6
```

Next: `v2.1.7 — Verification Report Freshness Lock + Warning Suppression`
