# v2.1.10 hotfix — dependency audit JSON parsing

This hotfix keeps the v2.1.10 milestone and fixes the false `audit-json-unavailable` status by parsing npm audit JSON from stdout, stderr, or a noisy combined stream.

Run from the repository root:

```powershell
python apply-v2.1.10-audit-json-hotfix.py
node --check scripts/dependency-audit-safe-upgrade-lock.mjs
npm run dependency:audit:safe-lock
npm run dependency:audit:safe-lock:check
npm run verify:ci-parity
```

Expected status with the current two moderate npm audit findings: `documented-noncritical`.
