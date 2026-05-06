# Public Demo Stable Release — v1.3.0

Public demo stable release baseline.

v1.3.0 is the stable public-demo release.

## Scope

- Stable public-demo release metadata
- Stable release checklist
- Final full QA artifact verification
- Final README/release documentation consistency
- No feature changes
- No provider changes
- No retrieval logic changes
- No export behavior changes

## Stable release requirements

- Public demo acceptance has passed.
- Hosted demo evidence review has passed.
- Public demo evidence lock has passed.
- Security/key handling has passed.
- Release warning cleanup has passed.
- Full QA gate has passed.
- Typecheck, lint, and build have passed.
- No root apply scripts are committed.
- The full QA artifact shows `app_version: 1.3.0`, `status: passed`, and `failed_gate_count: 0`.

## Release posture

This release is the public demo stable baseline. It does not add broad web/social/book discovery yet. Those capabilities belong to the post-stable product expansion roadmap.

## Validation

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
