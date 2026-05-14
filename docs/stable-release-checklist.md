# Stable Release Checklist — v2.1.5

## Required commands

```bash
npm run public-demo:stable:check
npm run public-demo:final:check
npm run hosted-demo:evidence:check
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
npm run public-demo:stable:check
```

## Artifact requirements

- `artifacts/full-qa-gate-report.json` exists.
- `full-qa-gate-report` is uploaded in CI.
- The full QA artifact shows `app_version: 2.1.5`.
- The full QA artifact shows `status: passed`.
- The full QA artifact shows `failed_gate_count: 0`.

## Repository requirements

- No root `apply-v*.mjs` scripts.
- No generated archives committed.
- No private credentials or provider keys.
- README, release checklist, and validation report identify v2.1.5.

## Product boundary

v2.1.5 does not introduce broad web/social/book discovery or generation support. Those are post-stable expansion milestones.
