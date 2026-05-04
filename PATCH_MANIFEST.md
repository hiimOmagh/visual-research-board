# v0.2.10 Patch Manifest — Provider Normalization + Deduplication

Apply this package over `visual-research-board-v0.2.9-free-image-retrieval-reference-hub`. It contains only files changed or added for v0.2.10.

## Objective

Add a normalization gate after provider retrieval so free/open provider results are canonicalized, duplicate records are merged, metadata gaps are visible, and exports preserve a traceable provider-source audit.

## Added

- `src/components/search/NormalizationDedupePanel.tsx`
- `docs/provider-normalization-deduplication.md`
- `tests/normalization-dedupe-check.mjs`

## Updated

- `src/lib/result-normalizer.ts` — canonical source/image URL normalization, duplicate merge logic, metadata-gap detection, duplicate trace diagnostics.
- `src/types/research.ts` — duplicate match reasons, metadata gaps, provider-source traces, normalization diagnostics, result canonical fields.
- `src/app/api/search/route.ts` — returns `normalization_dedupe` diagnostics and removes stale duplicate `autoTuning` declaration.
- `src/lib/client-search.ts` — static/demo responses include normalization diagnostics.
- `src/lib/project.ts` — migrations hydrate canonical/duplicate metadata and search history persists normalization diagnostics.
- `src/lib/export.ts` — JSON/Markdown/CSV exports include canonical URLs, duplicate merge context, and metadata gap data.
- `src/components/search/SearchPanel.tsx` — v0.2.10 header and NormalizationDedupePanel rendering.
- `src/components/search/ResultCard.tsx` and `ResultDetailPanel.tsx` — visible duplicate/metadata-gap cues.
- package/docs/tests versioned to v0.2.10.

## Validation

Passed in this build container:

```bash
npm run normalization:dedupe:check
npm run qa
```

`npm run typecheck` was not run here because the current container does not include installed Next/React/Node dependencies unless the recipient runs `npm install`.
