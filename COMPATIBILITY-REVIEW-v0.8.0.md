# Compatibility Review — v0.8.1 Public Demo Release Candidate

## Baseline

This patch is built on v0.8.1 — Security and Key Handling.

## Preserved surfaces

- Provider key handling remains server-only.
- `security:key:check` remains present.
- `qa:security` remains present.
- Full QA Gate remains the central deterministic QA runner.
- Manual/private workflow remains first-class.

## Added surfaces

- `public-demo:check`
- `qa:public-demo`
- `clean:rc`
- public demo release-candidate docs
- public demo helper and UI panel

## Non-goals

- No new providers
- No new scraping behavior
- No OAuth
- No paid-provider assumptions
- No legal-clearance claims
- No source-verification guarantees

## Risk controls

The public-demo checker scans public-facing docs and UI helper files for unsafe capability claims and secret-looking values. It also checks that v0.8.1 security scripts and security gate references remain present.
