
# v2.2.2 — Creator Workflow Interaction Polish + Real Use-Path Validation

## Objective

Move the v2.2.2 Creator Workflow MVP from contract-visible to use-path-valid.

The route remains local-first and transparent:

- no mandatory paid APIs
- no OAuth
- no live scraping
- no fake live claims
- fixture/demo mode is explicitly labeled when provider output is unavailable

## User path

1. Open `/creator-workflow`.
2. Load the built-in Carthage demo scenario.
3. Review the Research Brief completeness.
4. Inspect the Smart Query Plan Preview.
5. Review discovery results in transparent fixture/demo mode.
6. Save, reject, mark strong, mark weak/uncertain, add notes, copy attribution, or open sources.
7. Move saved references between board sections.
8. Inspect Evidence Pack Export Preview v2.
9. Copy the local export preview.

## Validation

```powershell
npm run creator-workflow:interaction:check
npm run qa
npm run verify:ci-parity
```

## Evidence artifact

`artifacts/creator-workflow-manual-review.json`

This artifact records route visibility, demo scenario use, transparent fixture mode, review action visibility, board section visibility, and known limitations.
