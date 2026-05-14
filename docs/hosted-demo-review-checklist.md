# Hosted Demo Review Checklist — v2.1.3

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
- screenshots are captured for the public demo entry state.
- screenshots are captured for evidence/export surfaces when available.
- The full-qa-gate-report artifact exists.
- The full-qa-gate-report artifact shows `status: passed`.
- The full-qa-gate-report artifact shows `failed_gate_count: 0`.
- The full-qa-gate-report artifact shows `app_version: 2.1.3`.

## Negative checks

- No claim of production scraping.
- No claim of automatic legal permission certainty.
- No claim of guaranteed source certainty.
- No private provider keys or credentials visible.
- No unavailable provider appears active.

## Release rule

Do not move beyond v2.1.3 until the hosted demo evidence has been reviewed against the committed documentation and QA artifact.
