# v0.6.0 — Museum/Open-Access Provider Pack

## Baseline

Built on v0.5.1 — Local Storage + Import/Export Hardening.

## Changed files

- `src/types/research.ts`
- `src/lib/query-planner.ts`
- `src/lib/provider-runtime.ts`
- `src/lib/result-normalizer.ts`
- `src/lib/result-quality.ts`
- `src/lib/providers/provider-utils.ts`
- `src/lib/providers/museum-open-access.ts`
- `src/app/api/search/route.ts`
- `src/app/api/provider-runtime/route.ts`
- `src/components/search/ProviderTogglePanel.tsx`
- `.env.example`
- `package.json`
- `package-lock.json`
- `README.md`
- `docs/museum-open-access-provider-pack.md`
- `tests/museum-open-access-provider-pack-check.mjs`
- version-aligned deterministic QA checks

## Summary

v0.6.0 adds a museum/open-access provider pack while preserving the free-source architecture and no-scraping policy.

Added no-key providers:

- Met Museum
- Art Institute of Chicago
- Cleveland Museum of Art
- Wellcome Collection
- Biodiversity Heritage Library
- Gallica / BnF
- National Archives / NARA

Added free-key providers:

- Rijksmuseum via `RIJKSMUSEUM_API_KEY`
- NYPL via `NYPL_API_KEY`
- DPLA via `DPLA_API_KEY`

The new providers are integrated into provider toggles, provider runtime readiness, source-class routing, the search API route, rights/source-access normalization, and QA.

## Validation

Expected checks:

```bash
npm run museum:providers:check
npm run qa
```

`npm run typecheck` and `npm run lint` require installed dependencies.

## Retained prior release gates

This patch keeps previous deterministic gates active, including:

- v0.4.1 — Coverage and Bias Audit
- v0.4.1 — Attribution Generator Upgrade
- v0.4.0 / v0.4.1 — Evidence Pack Export v1
- v0.5.1 — UX Reliability + Empty State Polish
- v0.5.1 — Local Storage + Import/Export Hardening
