# v2.1.9 — Verification Artifact Schema Lock + Release Evidence Index

## Apply

Copy `apply-v2.1.9-verification-artifact-schema-lock.py` into the repository root and run:

```powershell
python apply-v2.1.9-verification-artifact-schema-lock.py
```

## Validate

Fast local:

```powershell
npm run release:evidence:index
npm run verification:artifact-schema:check
npm run release:evidence:index:check
npm run verify:all
```

Full local confirmation:

```powershell
npm run qa
npm run verify:all
```

Clean install parity, optional but best before push:

```powershell
npm run verify:ci-parity
```

Do not run `npm audit fix --force`.

## Expected behavior

`verify:artifacts` now also generates:

```text
artifacts/release-evidence-index.json
```

The release verifier validates artifact schema and the evidence index.

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json,artifacts/npm-audit-v2.0.5.json,artifacts/npm-audit-v2.1.0.json,artifacts/npm-audit-v2.1.1.json,artifacts/npm-audit-v2.1.2.json,artifacts/npm-audit-v2.1.3.json,artifacts/npm-audit-v2.1.4.json,artifacts/npm-audit-v2.1.5.json,artifacts/npm-audit-v2.1.6.json,artifacts/npm-audit-v2.1.7.json,artifacts/npm-audit-v2.1.9.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Keep:

```text
artifacts/full-qa-gate-report.json
artifacts/release-verify-report.json
artifacts/release-evidence-index.json
artifacts/first-run-visual-evidence.json
artifacts/first-run-evidence-review.json
artifacts/first-run-demo-script.json
```

## Commit

```powershell
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md scripts/full-qa-gate.mjs scripts/release-verify.mjs scripts/release-evidence-index.mjs tests/full-qa-gate-check.mjs tests/release-verify-runner-check.mjs tests/verification-artifact-schema-lock-check.mjs tests/release-evidence-index-check.mjs docs/verification-artifact-schema-lock.md docs/release-evidence-index.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json artifacts/release-verify-report.json artifacts/release-evidence-index.json artifacts/first-run-visual-evidence.json artifacts/first-run-evidence-review.json artifacts/first-run-demo-script.json
git commit -m "test: add v2.1.9 verification artifact schema lock"
```

## Tag

After CI is green:

```powershell
git tag -a v2.1.9 -m "v2.1.9 — Verification Artifact Schema Lock + Release Evidence Index"
git push origin v2.1.9
```

## Next

`v2.1.9 — Release Evidence Dashboard Copy + Reviewer Handoff Pack`
