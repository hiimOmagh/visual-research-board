# v0.5.0 — UX Reliability + Empty State Polish

## Changed files

- `package.json`
- `package-lock.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `docs/ux-reliability-empty-state-polish.md`
- `src/lib/ux-reliability.ts`
- `src/lib/demo-project.ts`
- `src/components/search/UXReliabilityPanel.tsx`
- `src/components/search/SearchPanel.tsx`
- `src/components/search/ResultGrid.tsx`
- `src/components/search/ProviderTogglePanel.tsx`
- `src/components/search/ProjectLibraryPanel.tsx`
- `tests/ux-reliability-check.mjs`
- Existing QA tests updated to accept app version `0.5.0`.

## Summary

v0.5.0 adds a UX reliability layer for first-time and demo usage. It introduces workflow readiness scoring, a guided checklist, reliability notes, demo-project loading, demo-topic setup, clearer empty states, provider setup wording, and a dedicated validation gate.

## Validation

```bash
npm run ux:reliability:check
npm run qa
```

## Retained previous release gates

This v0.5.0 patch is built on the v0.4.1 baseline and keeps the previous release features/gates visible for deterministic QA compatibility:

- v0.4.1 — Attribution Generator Upgrade
- v0.4.0 / v0.4.1 — Evidence Pack Export v1
- v0.3.4 / v0.4.1 coverage gate — Coverage and Bias Audit
