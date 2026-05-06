# Final Demo Review Checklist — v1.8.0

## Required commands

```bash
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
npm run public-demo:final:check
```

## Hosted demo review

- Hosted demo URL loads.
- No private credentials are required.
- No provider key or secret is visible.
- Public-demo limitations are visible or clearly documented.
- Unavailable providers are not presented as active.
- There is no claim of production scraping.
- There is no claim of automatic legal permission certainty.
- There is no claim of guaranteed source certainty.
- Screenshots/evidence are captured for the hosted demo entry state.

## Release artifact review

- The full-qa-gate-report artifact exists.
- The full-qa-gate-report artifact shows `app_version: 1.8.0`.
- The full-qa-gate-report artifact shows `status: passed`.
- The full-qa-gate-report artifact shows `failed_gate_count: 0`.

## Release rule

Do not move to v1.8.0 until this final demo review is complete and CI is green.
