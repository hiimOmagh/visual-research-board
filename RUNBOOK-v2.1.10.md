# RUNBOOK v2.2.2 — Dependency Audit Resolution + Safe Upgrade Lock

## Purpose

This runbook locks the v2.2.2 release verification path after the dependency audit safe-upgrade lock was added.

It preserves the single-command verification UX while making the release evidence explicit:

- artifact generation
- release evidence indexing
- dependency audit safe-upgrade lock generation
- release verification
- nested verification warning silence
- final freshness recheck

## Primary command

Use this command for CI-parity verification from a clean dependency state:

```powershell
npm run verify:ci-parity
```

This command intentionally runs:

```powershell
npm ci
npm run verify:all
```

## Local verification command

Use this when `node_modules` already exists:

```powershell
npm run verify:all
```

`verify:all` must run:

```powershell
npm run verify:artifacts
npm run verify:release
```

## Artifact generation

`verify:artifacts` is compressed to a single script entry:

```powershell
npm run verify:artifacts
```

The compressed artifact command must generate:

```powershell
npm run first-run:visual:evidence
npm run first-run:evidence-review
npm run first-run:demo-script
npm run release:evidence:index
npm run dependency:audit:safe-lock
```

Expected artifact outputs:

- `artifacts/first-run-visual-evidence.json`
- `artifacts/first-run-evidence-review.json`
- `artifacts/first-run-demo-script.json`
- `artifacts/release-evidence-index.json`
- `artifacts/dependency-audit-safe-upgrade-lock.json`
- `artifacts/full-qa-gate-report.json`
- `artifacts/release-verify-report.json`

## Dependency audit policy

The dependency audit safe-upgrade lock must enforce:

- do not run `npm audit fix --force`
- package-lock review is required after dependency changes
- `npm run verify:ci-parity` is required after dependency changes
- high and critical vulnerabilities block release
- moderate vulnerabilities may only pass as documented-noncritical

Accepted lock statuses:

- `clean`
- `documented-noncritical`

Rejected lock statuses:

- `audit-json-unavailable`
- `blocked-high-critical`

## Required focused checks

```powershell
npm run dependency:audit:safe-lock
npm run dependency:audit:safe-lock:check
npm run release:evidence:index
npm run release:evidence:index:check
npm run verification:artifact-schema:check
npm run verification:freshness:check
npm run nested:verification:warnings:check
npm run release:verify:runner:check
```

## Release verification

The release verifier must include:

```powershell
npm run release:verify:runner:check
npm run single-command:verification:check
npm run ci-parity:workflow:check
npm run nested:verification:warnings:check
npm run qa
npm run verification:freshness:check
npm run release:evidence:index:check
npm run release:evidence:index
npm run verification:artifact-schema:check
npm run typecheck
npm run lint
npm run build
npm run release:package:audit:check
npm run release:verify:runner:check
npm run verification:freshness:check
```

## Nested verification warning silence

Nested verification warning silence means the release verifier should not leave stale `full-qa-gate-report.json` or stale `release-verify-report.json` warnings after the final verification pass.

Final expected state:

```text
Full QA gate passed for v2.2.2.
[release-verify] passed for v2.2.2
Verification Report Freshness Lock + Warning Suppression checks passed for v2.2.2.
Nested Verification Warning Silence + Final Freshness Recheck checks passed for v2.2.2.
```

## Final freshness recheck

After `npm run verify:ci-parity`, run this only if a freshness warning still appears:

```powershell
npm run verification:freshness:check
npm run verify:all
```

Clean final state means:

- `artifacts/full-qa-gate-report.json` has `appVersion` or equivalent version marker for `2.2.2`
- `artifacts/full-qa-gate-report.json` has passed status
- `artifacts/release-verify-report.json` has `appVersion` or equivalent version marker for `2.2.2`
- `artifacts/release-verify-report.json` has passed status
- `npm run verification:freshness:check` passes without stale-report warnings

## Do not use

```powershell
npm audit fix --force
```

Force dependency fixes are forbidden because they may introduce breaking dependency changes and invalidate the release evidence baseline.

## Release acceptance

v2.2.2 is accepted only when this command passes:

```powershell
npm run verify:ci-parity
```
