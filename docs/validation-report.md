# Validation Report — Visual Research Board v0.2.3

## Package

```text
visual-research-board-v0.2.3.zip
```

## Validation run

The package includes executable QA gates for:

```text
QA checks
normalization fixtures
E2E fixture checks
provider smoke fixture checks
library conflict checks
broad retrieval checks
retrieval evidence checks
provider runtime pack checks
retrieval calibration checks
```

Expected command:

```bash
npm run qa
```

Additional local validation before deployment:

```bash
npm install
npm run qa
npm run typecheck
npm run lint
npm run build
```

## Runtime evidence commands

Provider readiness/runtime smoke:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run provider:runtime:test
```

Live retrieval quality calibration:

```bash
VISUAL_RESEARCH_BOARD_RUNTIME_BASE_URL=http://localhost:3000 npm run retrieval:quality:test
```

## Evidence artifacts

```text
artifacts/provider-runtime-evidence.json
artifacts/retrieval-quality-calibration.json
```

## Status

`v0.2.3` is a live retrieval quality calibration package. It does not claim literal all-web crawling. It measures whether broad multi-provider search results are sufficiently relevant, visual, source-diverse, and useful for creator curation.
