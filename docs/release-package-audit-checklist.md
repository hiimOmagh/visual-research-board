
# Release Package Audit Checklist — v2.3.0

## package files

Check:

- package.json
- package-lock.json
- README.md
- PATCH_MANIFEST.md
- docs/release-checklist.md
- docs/validation-report.md
- artifacts/full-qa-gate-report.json

## required versions

- package.json version = `2.3.0`
- package-lock.json version = `2.3.0`
- package-lock root package version = `2.3.0`
- README.md references `v2.3.0`
- PATCH_MANIFEST.md references `v2.3.0`
- full QA artifact references `2.3.0` after `npm run qa`

## validation commands

```bash
npm ci
npm run release:package:audit:check
npm run public-demo:screenshot:check
npm run dependency:audit:triage:check
npm run stable:hygiene:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run release:package:audit:check
```

## GitHub Actions

GitHub Actions must pass before tagging.

## tag

```bash
git tag -a v2.3.0 -m "v2.3.0 — Release Package Audit"
git push origin v2.3.0
```

## generated/cache cleanup

Before commit, remove node_modules, .next, out, dist, coverage, playwright-report, test-results, __pycache__, root apply scripts, local zip/tar/tgz/log files, and local npm audit JSON scratch files unless deliberately committed as evidence.

## review outcome

Record final outcome: local validation, CI validation, tag status, blocking issues, and follow-up milestone.
