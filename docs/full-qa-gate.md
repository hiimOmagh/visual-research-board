# v1.8.0 — Full QA Gate

v1.8.0 consolidates the project validation surface into one categorized runner.

## Commands

```bash
npm run qa
npm run qa:list
npm run qa:baseline
npm run qa:retrieval
npm run qa:providers
npm run qa:workflow
npm run qa:exports
npm run qa:release
npm run full:qa:check
```

## Categories

| Command | Gate category |
|---|---|
| `npm run qa:baseline` | Static app checks, normalization fixtures, E2E fixtures, provider smoke fixtures, library conflict fixtures, lockfile registry. |
| `npm run qa:retrieval` | Broad retrieval, retrieval evidence, calibration, auto-tuning, real-topic matrix, query routing, dedupe, ranking explainability. |
| `npm run qa:providers` | Provider runtime, provider result inspector, museum/open-access providers, stock/illustrative providers. |
| `npm run qa:workflow` | Manual review, review evidence, project memory, board organization, claim mapping, coverage/bias, UX reliability, storage hardening. |
| `npm run qa:exports` | Evidence pack export and attribution generator. |
| `npm run qa:release` | Deployed-browser evidence checks and full QA manifest integrity. |

## Evidence artifact

Every `npm run qa` execution writes:

```text
artifacts/full-qa-gate-report.json
```

The artifact includes:

```text
schema_version
app_version
gate
started_at
finished_at
selected_category
total_gate_count
passed_gate_count
failed_gate_count
status
categories
results
```

## CI boundary

`npm run qa` is deterministic and does not require browser automation, live provider keys, or a deployed app. The full no-browser CI command is:

```bash
npm run test:ci:no-browser
```

That command runs:

```text
Full QA Gate → Typecheck → Lint
```

Runtime build validation remains separate:

```bash
npm run build
```

## Why this exists

Before v1.8.0, `npm run qa` was a long shell chain. That made it harder to isolate failures, run one family of checks, or attach release evidence. v1.8.0 makes the validation layer inspectable without changing product behavior.

## v1.8.0 security category

Additional gate:

```bash
npm run qa:security
npm run security:key:check
```

The security category verifies server-only provider key handling, redacted diagnostics, and public-env leak checks.

## v1.8.0 public-demo category

Additional gate:

```bash
npm run qa:public-demo
npm run public-demo:check
```

The public-demo category verifies release-candidate copy, demo-safety docs, unavailable-provider boundaries, and preservation of v1.8.0 server-only provider key handling.
