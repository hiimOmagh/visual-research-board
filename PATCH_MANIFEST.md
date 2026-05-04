# v0.4.0 — Evidence Pack Export v1

## Changed files

- `package.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `docs/evidence-pack-export-v1.md`
- `src/types/research.ts`
- `src/lib/evidence-pack-export.ts`
- `src/lib/export.ts`
- `src/lib/client-search.ts`
- `src/app/api/search/route.ts`
- `src/app/api/export/route.ts`
- `src/components/search/ExportPreviewDrawer.tsx`
- `src/components/search/SavedBoard.tsx`
- `src/components/search/SearchPanel.tsx`
- `tests/evidence-pack-export-check.mjs`

## Summary

Adds Evidence Pack Export v1 with reusable, check-required, reference-only, and restricted/rejected buckets. The pack is available as JSON, Markdown, CSV, and HTML, and search/export diagnostics now include evidence-pack counts.

## Validation

- `npm run evidence:pack:check`
- `npm run qa`

## Compatibility notes

Continues the Coverage and Bias Audit gate from v0.3.4.
