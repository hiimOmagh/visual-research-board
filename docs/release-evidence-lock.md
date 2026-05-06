# Release Evidence Lock — v1.9.0

## Required local validation

```bash
npm run public-demo:evidence:check
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Required CI evidence

- GitHub Actions validate job passes.
- `full-qa-gate-report` artifact is produced.
- The artifact is based on `artifacts/full-qa-gate-report.json`.
- The full QA gate reports zero failed gates for the current release.

## Release posture

This is not a product expansion. It is an evidence lock for public-demo readiness.
