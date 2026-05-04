# v0.2.9 Patch Manifest — Free Image Retrieval + Reference Search Hub

Apply this package over `visual-research-board-v0.2.8-review-evidence-feedback`. It contains only files changed or added for v0.2.9.

## Added files

- `docs/free-image-retrieval-reference-hub.md`
- `src/components/search/ReferenceSearchHub.tsx`
- `src/lib/providers/europeana.ts`
- `src/lib/providers/internet-archive.ts`
- `src/lib/providers/loc.ts`
- `src/lib/providers/nasa.ts`
- `src/lib/providers/openverse.ts`
- `src/lib/providers/smithsonian.ts`
- `src/lib/reference-search.ts`
- `tests/free-image-retrieval-check.mjs`

## Modified files

- `.env.example`
- `README.md`
- `docs/provider-setup.md`
- `PATCH_MANIFEST.md`
- `package-lock.json`
- `package.json`
- `src/app/api/provider-runtime/route.ts`
- `src/app/api/search/route.ts`
- `src/components/search/ProviderRuntimePanel.tsx`
- `src/components/search/ProviderTogglePanel.tsx`
- `src/components/search/ResultCard.tsx`
- `src/components/search/SearchPanel.tsx`
- `src/lib/client-search.ts`
- `src/lib/evidence-driven-tuning.ts`
- `src/lib/export.ts`
- `src/lib/manual-import.ts`
- `src/lib/project.ts`
- `src/lib/provider-runtime.ts`
- `src/lib/result-normalizer.ts`
- `src/lib/result-quality.ts`
- `src/lib/retrieval-autotuning.ts`
- `src/lib/review-evidence-feedback.ts`
- `src/lib/risk.ts`
- `src/types/research.ts`
- `tests/fixtures/provider-smoke-stable.json`
- `tests/provider-runtime-pack-check.mjs`
- `tests/provider-smoke-check.mjs`
- `tests/qa-check.mjs`
- other version-aligned validation/documentation files touched by the v0.2.9 version bump

## Deleted files

- none

## Validation performed

- `npm run free:image:check` — passed
- `npm run qa` — passed
- `node tests/provider-smoke-check.mjs` — passed
- `node tests/provider-runtime-pack-check.mjs` — passed
- `npm run typecheck` — attempted but not completed because `node_modules` is absent in this container; failures were missing Next/React/Node/Tailwind type dependencies, not a confirmed source-level failure.
