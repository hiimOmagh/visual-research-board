# Hosted Demo Review Checklist — v0.8.3

## Required commands

```bash
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
```

## Hosted evidence

- Hosted URL loads.
- Landing page copy matches README and public-demo docs.
- Screenshots are captured for the public demo entry state.
- Screenshots are captured for evidence/export surfaces when available.
- The full-qa-gate-report artifact exists.
- The full-qa-gate-report artifact shows `status: passed`.
- The full-qa-gate-report artifact shows `failed_gate_count: 0`.
- The full-qa-gate-report artifact shows `app_version: 0.8.3`.

## Negative checks

- No claim of production scraping.
- No claim of automatic legal clearance.
- No claim of guaranteed source verification.
- No private provider keys or credentials visible.
- No unavailable provider appears active.

## Release rule

Do not move beyond v0.8.3 until the hosted demo evidence has been reviewed against the committed documentation and QA artifact.
