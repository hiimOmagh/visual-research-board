# Validation Report — Visual Research Board v0.8.2

## Package

```text
visual-research-board-v0.8.2-full-qa-gate-patch.zip
```

## Release focus

**Full QA Gate**. This release consolidates deterministic validation into a categorized runner and generates machine-readable release evidence.

## Expected command

```bash
npm run qa
```

## Evidence artifact

```text
artifacts/full-qa-gate-report.json
```

## Included gate categories

```text
baseline
retrieval
providers
workflow
exports
release
```

## Additional local validation before deployment

```bash
npm run typecheck
npm run lint
npm run build
npm run build:static
```

## Runtime evidence commands retained

Provider readiness/runtime smoke:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run provider:runtime:test
```

Live retrieval quality calibration:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run retrieval:quality:test
```

## Status standard

A v0.8.2 validation pass requires:

```text
npm run qa: passed
artifacts/full-qa-gate-report.json: generated
failed_gate_count: 0
```

v0.8.2 does not expand scraping, provider access, or search-engine automation. It hardens the project’s ability to prove that the current research workflow remains intact.

## v0.8.2 Security and Key Handling

Security and Key Handling adds provider-key diagnostics to the Full QA Gate. It validates server-only env usage, redacted key presence, and public-env leakage detection while preserving the existing `artifacts/full-qa-gate-report.json` evidence artifact.

## v0.8.2 Public Demo Release Candidate

v0.8.2 hardens the project for public-demo inspection. It adds a public-demo release-candidate check, a cleanup command, demo-safe documentation, and explicit non-goals around scraping, production OAuth, legal clearance, and source-verification guarantees.

Required validation:

```bash
npm run clean:rc
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## v0.8.2 — Release Warning Cleanup

This micro-patch removes targeted lint warnings and updates CI action/runtime references while preserving v0.8.2 Public Demo Release Candidate and Security and Key Handling behavior.

Validation:

```bash
npm run release:warning:check
npm run public-demo:check
npm run qa:public-demo
npm run security:key:check
npm run qa
npm run typecheck
npm run lint
npm run build
```

## v0.8.2 Public Demo Evidence Lock

v0.8.2 adds a public-demo evidence lock gate. It verifies release evidence docs, preserved public-demo/security/warning checks, and Full QA Gate inclusion.

Required validation:

```bash
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
