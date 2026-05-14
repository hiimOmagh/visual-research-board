# v2.1.5 — Single-Command Verification UX + Release Command Compression

## Apply

Copy `apply-v2.1.5-single-command-verification.py` into the repository root and run:

```powershell
python apply-v2.1.5-single-command-verification.py
```

## Validate

Normal local validation:

```powershell
npm run verify:all
```

Then confirm the new gate is included:

```powershell
npm run single-command:verification:check
npm run qa
npm run verify:all
```

Clean install parity, optional but preferred before push:

```powershell
npm run verify:ci-parity
```

Do not run `npm audit fix --force`.

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json,artifacts/npm-audit-v2.0.5.json,artifacts/npm-audit-v2.1.0.json,artifacts/npm-audit-v2.1.1.json,artifacts/npm-audit-v2.1.2.json,artifacts/npm-audit-v2.1.3.json,artifacts/npm-audit-v2.1.4.json,artifacts/npm-audit-v2.1.5.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Keep:

```text
artifacts/full-qa-gate-report.json
artifacts/release-verify-report.json
artifacts/first-run-visual-evidence.json
artifacts/first-run-evidence-review.json
artifacts/first-run-demo-script.json
```

## Commit

```powershell
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs scripts/release-verify.mjs tests/full-qa-gate-check.mjs tests/release-verify-runner-check.mjs tests/single-command-verification-check.mjs docs/single-command-verification.md docs/release-command-compression.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json artifacts/release-verify-report.json artifacts/first-run-visual-evidence.json artifacts/first-run-evidence-review.json artifacts/first-run-demo-script.json
git commit -m "test: formalize v2.1.5 single-command verification"
```

## Tag

After CI is green:

```powershell
git tag -a v2.1.5 -m "v2.1.5 — Single-Command Verification UX + Release Command Compression"
git push origin v2.1.5
```

## Next

`v2.1.6 — CI Parity Workflow Badge + Verification Docs Lock`
