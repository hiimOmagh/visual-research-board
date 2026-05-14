# v2.0.5 — Unified Release Verification Runner

## Apply

Copy `apply-v2.0.5-unified-release-verification-runner.py` into the repository root and run:

```powershell
python apply-v2.0.5-unified-release-verification-runner.py
```

## Validate

Install first:

```powershell
npm ci
```

Then run:

```powershell
npm run release:verify:runner:check
npm run verify:release
npm run qa
npm run typecheck
npm run lint
npm run build
npm run verify:release
```

The main command is:

```powershell
npm run verify:release
```

The clean install parity command is:

```powershell
npm run verify:ci-parity
```

Do not run `npm audit fix --force`.

## Cleanup before commit

```powershell
rm -r -fo node_modules,.next,out,dist,coverage,playwright-report,test-results,__pycache__ -ErrorAction SilentlyContinue
rm -fo apply-v*.mjs,apply-v*.py,*.zip,*.tar,*.tgz,*.log -ErrorAction SilentlyContinue
rm -fo artifacts/npm-audit-v2.0.2.json,artifacts/npm-audit-v2.0.3.json,artifacts/npm-audit-v2.0.4.json,artifacts/npm-audit-v2.0.5.json -ErrorAction SilentlyContinue
git restore tsconfig.tsbuildinfo 2>$null
```

Keep `artifacts/release-verify-report.json` if you want the verification report committed. It is recommended for this milestone.

## Commit

```powershell
git status --short
git add package.json package-lock.json README.md PATCH_MANIFEST.md .github/workflows scripts/release-verify.mjs scripts/full-qa-gate.mjs tests/full-qa-gate-check.mjs tests/release-verify-runner-check.mjs docs/unified-release-verification-runner.md docs/release-verification-runner-checklist.md docs/release-checklist.md docs/validation-report.md artifacts/full-qa-gate-report.json artifacts/release-verify-report.json
git commit -m "chore: add v2.0.5 unified release verification runner"
```

## Tag

After CI is green:

```powershell
git tag -a v2.0.5 -m "v2.0.5 — Unified Release Verification Runner"
git push origin v2.0.5
```

## Next

`v2.1.0 — First-Run UX + Workflow Clarity`
