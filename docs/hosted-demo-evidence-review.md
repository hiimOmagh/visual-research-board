# Hosted Demo Evidence Review — v1.2.0

v1.2.0 locks the evidence-review process for the hosted public demo.

## Scope

- Hosted demo behavior review
- README/demo-copy consistency review
- Full QA artifact review
- Manual screenshot/evidence checklist
- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes

## Hosted demo URL

Record the hosted demo URL here after deployment:

```text
Hosted demo URL: pending
```

If the URL is still pending, do not claim that a hosted deployment has been verified.

## Manual evidence

Capture or confirm:

- Landing page / initial public demo state
- Provider/runtime status panel if visible
- Export/review surface if visible
- Public-demo limitation copy
- Full QA artifact named `full-qa-gate-report`
- No private credentials displayed
- No fake-live provider claims

## Validation

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

## Pass condition

The hosted demo evidence review is complete only when the hosted URL, screenshots/evidence, docs, and full QA artifact match the public-demo behavior.
