# Compatibility Review — v0.8.2 Public Demo Evidence Lock

## Baseline

Built on v0.8.2 — Release Warning Cleanup.

## Preserved surfaces

- Public Demo Release Candidate validation
- Security and Key Handling validation
- Release Warning Cleanup validation
- Full QA Gate
- Existing export surface
- Existing provider behavior
- Existing manual/private workflow

## Added surfaces

- `public-demo:evidence:check`
- `tests/public-demo-evidence-lock-check.mjs`
- `docs/public-demo-evidence-lock.md`
- `docs/release-evidence-lock.md`
- Full QA release gate: `public-demo-evidence-lock`

## Non-goals

- No feature expansion
- No new providers
- No scraping behavior
- No OAuth
- No export behavior change
