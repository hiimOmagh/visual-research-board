# v2.1.10 — Dependency Audit Resolution + Safe Upgrade Lock

## Install

Copy `apply-v2.1.10-dependency-audit-safe-upgrade-lock.py` into the repository root, then run:

```powershell
python apply-v2.1.10-dependency-audit-safe-upgrade-lock.py
npm run dependency:audit:safe-lock
npm run dependency:audit:safe-lock:check
npm run verify:ci-parity
```

## Included full files

- `apply-v2.1.10-dependency-audit-safe-upgrade-lock.py`
- `scripts/dependency-audit-safe-upgrade-lock.mjs`
- `tests/dependency-audit-safe-upgrade-lock-check.mjs`
- `docs/dependency-audit-safe-upgrade-lock.md`

The Python patch also updates existing repo files:

- `package.json`
- `scripts/verify-artifacts.mjs`
- `scripts/release-verify.mjs`
- `scripts/full-qa-gate.mjs`
- `README.md`, if present
