# Public Demo Evidence Lock — v2.1.3

v2.1.3 locks public-demo evidence after the Public Demo Release Candidate and Release Warning Cleanup passed.

## Scope

- Evidence/validation lock only
- no feature changes
- no provider changes
- no retrieval behavior changes
- no export behavior changes
- no security/key-handling changes

## Evidence surfaces

The release expects these validation surfaces to remain available:

- `npm run public-demo:evidence:check`
- `npm run release:warning:check`
- `npm run public-demo:check`
- `npm run qa:public-demo`
- `npm run security:key:check`
- `npm run qa`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

The CI run should produce the `full-qa-gate-report` artifact from `artifacts/full-qa-gate-report.json`.

## Non-goals

- No new scraping behavior
- No production OAuth
- No automatic legal clearance
- No guaranteed source verification
- No new provider capability

## Pass condition

v2.1.3 is locked only when local validation and CI both pass with a produced full QA evidence artifact.
