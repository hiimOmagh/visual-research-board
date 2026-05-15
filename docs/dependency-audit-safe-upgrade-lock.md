# Dependency Audit Resolution + Safe Upgrade Lock

Version: v2.1.11

This release locks dependency-audit handling into the release process without using unsafe automatic upgrades.

## Policy

- `npm audit fix --force` is forbidden.
- High or critical vulnerabilities block release.
- Low or moderate vulnerabilities require documented triage.
- Any dependency change requires `npm run verify:ci-parity`.
- `package-lock.json` changes must be reviewed as release evidence.
- The audit state is recorded in `artifacts/dependency-audit-safe-upgrade-lock.json`.

## Commands

```powershell
npm run dependency:audit:safe-lock
npm run dependency:audit:safe-lock:check
npm run verify:ci-parity
```

## Release integration

The dependency audit safe-upgrade lock is included in:

- `verify:artifacts`
- `verify:release`
- `qa`
- `verify:ci-parity`
