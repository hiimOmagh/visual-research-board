# v0.6.1 — Stock/Illustrative Provider Pack

## Baseline

Built on v0.6.0 — Museum/Open-Access Provider Pack.

## Changed files

- `src/types/research.ts`
- `src/lib/query-planner.ts`
- `src/lib/provider-runtime.ts`
- `src/lib/result-normalizer.ts`
- `src/lib/result-quality.ts`
- `src/lib/retrieval-autotuning.ts`
- `src/lib/evidence-driven-tuning.ts`
- `src/lib/providers/stock-illustrative.ts`
- `src/app/api/search/route.ts`
- `src/app/api/provider-runtime/route.ts`
- `src/lib/client-search.ts`
- `src/components/search/ProviderTogglePanel.tsx`
- `src/components/search/SearchPanel.tsx`
- `src/components/search/ProjectLibraryPanel.tsx`
- `src/components/search/UXReliabilityPanel.tsx`
- `.env.example`
- `package.json`
- `package-lock.json`
- `README.md`
- `docs/stock-illustrative-provider-pack.md`
- `tests/stock-illustrative-provider-pack-check.mjs`

## Summary

v0.6.1 adds optional stock/illustrative providers while preserving the free-source architecture and no-scraping policy.

Added free-key providers, disabled by default:

- Pixabay via `PIXABAY_API_KEY`
- Pexels via `PEXELS_API_KEY`
- Unsplash via `UNSPLASH_ACCESS_KEY`

The provider pack is integrated into provider toggles, provider runtime readiness, source-class routing, the search API route, source-access normalization, result-quality classification, ranking/tuning weights, and deterministic QA.

## Guardrails

- Stock providers are not treated as institutional/archive evidence.
- Results are labeled `source_access_mode: stock_illustrative`.
- Results use `rights_status: likely_reusable` and `reuse_risk: medium` to force rights verification before publication.
- Providers require free keys and remain off by default.

## Validation

Expected checks:

```bash
npm run stock:providers:check
npm run qa
```

`npm run typecheck` and `npm run lint` require installed dependencies.

## Retained prior gates

The v0.4.1 Coverage and Bias Audit gate remains active in QA, alongside Attribution Generator Upgrade, Evidence Pack Export v1, UX Reliability, Local Storage Hardening, and the v0.6.0 Museum/Open-Access Provider Pack.

Retained feature gates include UX Reliability + Empty State Polish and Local Storage + Import/Export Hardening.
