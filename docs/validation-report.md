# Validation Report — Visual Research Board v0.7.0

## Package

```text
visual-research-board-v0.7.0-full-qa-gate-patch.zip
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

A v0.7.0 validation pass requires:

```text
npm run qa: passed
artifacts/full-qa-gate-report.json: generated
failed_gate_count: 0
```

v0.7.0 does not expand scraping, provider access, or search-engine automation. It hardens the project’s ability to prove that the current research workflow remains intact.
