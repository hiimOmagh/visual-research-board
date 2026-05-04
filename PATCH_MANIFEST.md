# v0.4.1 — Attribution Generator Upgrade

## Scope

This patch upgrades attribution handling after Evidence Pack Export v1.

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `src/types/research.ts`
- `src/lib/attribution-generator.ts`
- `src/lib/export.ts`
- `src/lib/evidence-pack-export.ts`
- `src/lib/client-search.ts`
- `src/app/api/search/route.ts`
- `src/app/api/export/route.ts`
- `src/components/search/SavedBoard.tsx`
- `src/components/search/SearchPanel.tsx`
- `docs/attribution-generator-upgrade.md`
- `docs/evidence-pack-export-v1.md`
- `tests/attribution-generator-check.mjs`
- version-aligned QA gate files under `tests/`

## Feature additions

- License-aware attribution generator.
- Multiple attribution formats:
  - simple
  - creator/title/source/license
  - Markdown citation block
  - video description block
  - article source list
  - rough bibliography entry
- Attribution clearance labels:
  - attribution-ready candidate
  - verify before use
  - reference only
  - do not use
- Attribution warnings for unclear rights, missing license URLs, reference-only records, restricted/rejected records, manual-reference imports, reuse risk, metadata gaps, and manual review verdicts.
- Attribution JSON/Markdown/CSV exports.
- Attribution audit integration in JSON export, project-library export, API search diagnostics, and static client search diagnostics.
- Evidence Pack v1 attribution lines now use the upgraded attribution generator.

## Validation

- `npm run attribution:generator:check`
- `npm run qa`

## Retained prior gates

This patch preserves earlier release capabilities including Coverage and Bias Audit and Evidence Pack Export v1 while adding the attribution generator upgrade.
