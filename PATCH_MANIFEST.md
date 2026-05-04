# v0.3.4 — Coverage and Bias Audit

## Added

- `src/lib/coverage-bias-audit.ts`
- `src/components/search/CoverageBiasAuditPanel.tsx`
- `docs/coverage-bias-audit.md`
- `tests/coverage-bias-check.mjs`

## Updated

- `src/types/research.ts`
- `src/components/search/SearchPanel.tsx`
- `src/app/api/search/route.ts`
- `src/lib/client-search.ts`
- `src/lib/export.ts`
- `package.json`
- existing QA version expectations
- README

## Capability

Adds a project and search-result audit for provider/domain/source-group concentration, rights-risk load, reference-only overload, high-reuse-risk material, unsupported claims, missing counter-evidence, and unmapped saved sources.

## Validation

- `npm run coverage:bias:check`
- `npm run qa`
