# Public Demo Final Acceptance — v1.9.0

v1.9.0 is the final public-demo acceptance milestone before the stable public-demo release.

## Scope

- Hosted demo acceptance review
- Public-demo copy consistency
- Full QA artifact verification
- Final release checklist
- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes

## Hosted demo URL

Record the hosted demo URL here after deployment verification:

```text
Hosted demo URL: pending
```

Do not claim hosted-demo verification until the hosted URL has been opened and reviewed.

## Acceptance requirements

- Hosted demo loads without credentials.
- Landing/public-demo copy explains the product clearly.
- Demo does not imply production scraping.
- Demo does not imply legal clearance.
- Demo does not imply guaranteed source certainty.
- Provider/runtime status is honest.
- No private provider credentials are visible.
- Full QA artifact is current and passed.
- README and docs match hosted behavior.
- No root apply scripts are committed.

## Validation

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
