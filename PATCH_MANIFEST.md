# v0.5.1 — Local Storage + Import/Export Hardening

## Changed files

- `package.json`
- `README.md`
- `PATCH_MANIFEST.md`
- `src/lib/storage-hardening.ts`
- `src/components/search/SearchPanel.tsx`
- `src/components/search/ProjectLibraryPanel.tsx`
- `docs/local-storage-import-export-hardening.md`
- `tests/storage-hardening-check.mjs`
- Updated validation scripts to expect `v0.5.1`.

## Added capability

v0.5.1 adds schema-aware local storage import/export hardening:

- backup envelopes
- import validation reports
- corrupted-file warnings
- migration-required reports
- checksum/fingerprint metadata
- safer backup restore path
- visible import validation feedback

## Validation

- `npm run storage:hardening:check`
- `npm run qa`

## Retained previous release gates

This v0.5.1 patch is built on the v0.5.0 baseline and keeps previous release features/gates visible for deterministic QA compatibility:

- v0.5.0 — UX Reliability + Empty State Polish
- v0.4.1 — Attribution Generator Upgrade
- v0.4.0 / v0.4.1 — Evidence Pack Export v1
- v0.3.4 / v0.4.1 coverage gate — Coverage and Bias Audit
